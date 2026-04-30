import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireOwnedRequest } from '~~/server/utils/auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'
import { buildDispatchPreviewText, sendTelegramDispatchMessage } from '~~/server/utils/telegram-dispatch'

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
  const summary = body.problem_summary?.trim()
  const visitTimeAtRaw = body.visit_time_at?.trim()
  const phone = body.phone?.trim()
  const addressText = body.address_text?.trim()
  const lat = body.address_lat
  const lng = body.address_lng

  if (!summary || summary.length < 8) {
    apiError(422, 'validation.failed', 'problem_summary is required')
  }
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

  const { request } = await requireOwnedRequest(event, requestId)
  const supabase = getSupabaseAdmin(event)
  const config = useRuntimeConfig(event)

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
      status: 'dispatched',
      current_dispatch_attempt: request.current_dispatch_attempt + 1
    })
    .eq('id', request.id)
    .select('*')
    .single()

  if (updateError || !updatedRequest) {
    apiError(500, 'db.failed', 'Failed to update request', { reason: updateError?.message })
  }

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
  const { data: dispatch, error: dispatchError } = await supabase
    .from('dispatch_records')
    .insert({
      request_id: request.id,
      attempt_no: updatedRequest.current_dispatch_attempt,
      telegram_group_id: Number(config.telegramMastersGroupId || 0),
      status: 'pending_send',
      expires_at: expiresAt
    })
    .select('id, expires_at')
    .single()

  if (dispatchError || !dispatch) {
    apiError(500, 'db.failed', 'Failed to create dispatch record', { reason: dispatchError?.message })
  }

  if (!config.telegramBotToken || !config.telegramMastersGroupId || Number(config.telegramMastersGroupId) === 0) {
    apiError(500, 'config.missing', 'TELEGRAM_BOT_TOKEN or TELEGRAM_MASTERS_GROUP_ID is missing')
  }

  const previewText = await buildDispatchPreviewText(event, {
    public_code: updatedRequest.public_code,
    domain_id: updatedRequest.domain_id,
    issue_custom: updatedRequest.issue_custom,
    problem_summary: updatedRequest.problem_summary,
    urgency: updatedRequest.urgency,
    visit_time_mode: updatedRequest.visit_time_mode,
    visit_time_at: updatedRequest.visit_time_at,
    locale: updatedRequest.locale
  })

  const claimUrl = config.miniAppBaseUrl
    ? `${String(config.miniAppBaseUrl).replace(/\/+$/, '')}/master/dispatches/${dispatch.id}`
    : ''
  const claimButtonText = updatedRequest.locale === 'ru' ? 'Принять заказ' : 'Буюртмани қабул қилиш'
  const sent = await sendTelegramDispatchMessage(
    config.telegramBotToken,
    Number(config.telegramMastersGroupId),
    previewText,
    claimUrl ? { text: claimButtonText, url: claimUrl } : undefined
  )
  if (!sent.ok) {
    await supabase.from('dispatch_records').update({ status: 'failed_send' }).eq('id', dispatch.id)
    apiError(500, 'dispatch.send_failed', 'Failed to send message to Telegram group', { reason: sent.error })
  }

  await supabase
    .from('dispatch_records')
    .update({
      status: 'open',
      telegram_message_id: sent.messageId
    })
    .eq('id', dispatch.id)

  const aiReply =
    request.locale === 'ru'
      ? 'Спасибо. Все данные переданы мастерам.'
      : 'Раҳмат. Барча маълумотларингиз мастерларга юборилди.'

  await supabase.from('request_intake_messages').insert([
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
  ])

  return ok({
    ai_reply: aiReply,
    request: updatedRequest,
    dispatch_id: dispatch.id,
    expires_at: dispatch.expires_at
  })
})
