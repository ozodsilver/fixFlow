import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireOwnedRequest } from '~~/server/utils/auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'
import { createPendingDispatchReview } from '~~/server/utils/dispatch-flow'
import { buildAdminReviewNotificationText, sendTelegramUserMessage } from '~~/server/utils/telegram-dispatch'

interface StructuredBody {
  phone?: string
  visit_time_at?: string
  problem_summary?: string
  address_text?: string
  address_lat?: number
  address_lng?: number
}

function normalizePhone(raw: string): string | null {
  const clean = raw.replace(/[^\d+]/g, '')
  if (!clean) return null
  if (clean.startsWith('+') && /^\+[1-9][0-9]{7,14}$/.test(clean)) return clean
  if (/^998\d{9}$/.test(clean)) return `+${clean}`
  if (/^\d{9}$/.test(clean)) return `+998${clean}`
  return null
}

export default defineEventHandler(async (event) => {
  const requestId = getRouterParam(event, 'requestId')
  if (!requestId) {
    apiError(422, 'validation.failed', 'requestId is required')
  }

  const body = await readBody<StructuredBody>(event)
  const visitTimeAtRaw = body.visit_time_at?.trim()
  const phone = body.phone?.trim()
  const addressText = body.address_text?.trim()
  const lat = body.address_lat
  const lng = body.address_lng
  if (!visitTimeAtRaw) {
    apiError(422, 'validation.failed', 'visit_time_at is required')
  }
  if (!phone) {
    apiError(422, 'validation.failed', 'phone is required')
  }
  if (!addressText || typeof lat !== 'number' || typeof lng !== 'number') {
    apiError(422, 'validation.failed', 'address_text, address_lat, address_lng are required')
  }

  const phoneE164 = normalizePhone(phone)
  if (!phoneE164) {
    apiError(422, 'validation.failed', 'phone is invalid')
  }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    apiError(422, 'validation.failed', 'Invalid map coordinates')
  }

  const visitDate = new Date(visitTimeAtRaw)
  if (Number.isNaN(visitDate.getTime())) {
    apiError(422, 'validation.failed', 'visit_time_at is invalid')
  }

  const { ctx, request } = await requireOwnedRequest(event, requestId)
  const summary = body.problem_summary?.trim() || request.problem_summary?.trim() || ''
  if (summary.length < 8) {
    apiError(422, 'validation.failed', 'problem_summary is required')
  }
  const supabase = getSupabaseAdmin(event)

  if (request.current_dispatch_attempt >= 3) {
    apiError(409, 'dispatch.max_attempts_exhausted', 'Max dispatch attempts exhausted')
  }

  const { data: updatedRequest, error: updateError } = await supabase
    .from('service_requests')
    .update({
      phone_e164: phoneE164,
      problem_summary: summary.slice(0, 240),
      address_text: addressText.slice(0, 280),
      address_lat: lat,
      address_lng: lng,
      visit_time_mode: 'scheduled',
      visit_time_at: visitDate.toISOString(),
      status: 'ready_for_dispatch'
    })
    .eq('id', request.id)
    .select('*')
    .single()

  if (updateError || !updatedRequest) {
    apiError(500, 'db.failed', 'Failed to update request', { reason: updateError?.message })
  }

  const reviewId = await createPendingDispatchReview(event, updatedRequest)

  const aiReply =
    request.locale === 'ru'
      ? 'Спасибо. Заявка отправлена администратору на проверку.'
      : 'Раҳмат. Мурожаат админ текширувига юборилди.'

  const config = useRuntimeConfig(event)
  const notifyAdmin = async () => {
    const adminChatId = Number(config.telegramAdminChatId)
    if (!config.telegramBotToken || !Number.isFinite(adminChatId) || adminChatId === 0) return

    const sent = await sendTelegramUserMessage(
      config.telegramBotToken,
      adminChatId,
      buildAdminReviewNotificationText({
        public_code: updatedRequest.public_code,
        requester_name: ctx.user.display_name,
        phone_e164: updatedRequest.phone_e164,
        problem_summary: updatedRequest.problem_summary,
        locale: updatedRequest.locale
      })
    )

    if (!sent.ok) {
      console.warn('telegram.admin_review_notify_failed', sent.error)
    }
  }

  await Promise.allSettled([
    supabase.from('request_intake_messages').insert([
      {
        request_id: request.id,
        sender: 'user',
        message_text: summary,
        field_patch: {
          phone_e164: phoneE164,
          address_text: addressText,
          address_lat: lat,
          address_lng: lng,
          problem_summary: summary
        }
      },
      {
        request_id: request.id,
        sender: 'ai',
        message_text: aiReply,
        field_patch: {},
        validation_snapshot: {
          intent: 'ready',
          missing_required: [],
          ready_for_dispatch: true
        }
      }
    ]),
    notifyAdmin()
  ])

  return ok({
    ai_reply: aiReply,
    request: updatedRequest,
    review_id: reviewId,
    dispatch_id: null,
    expires_at: null,
    admin_review_required: true
  })
})
