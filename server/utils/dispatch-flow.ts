import type { H3Event } from 'h3'
import { apiError } from './api'
import { getSupabaseAdmin } from './supabase-admin'
import { buildDispatchPreviewText, sendTelegramDispatchMessage } from './telegram-dispatch'

interface DispatchableRequest {
  id: string
  public_code: string
  domain_id: number
  problem_summary: string | null
  visit_time_mode: 'asap' | 'scheduled' | null
  visit_time_at: string | null
  locale: 'uz_cyrl' | 'ru'
  current_dispatch_attempt: number
}

function buildClaimButton(config: ReturnType<typeof useRuntimeConfig>, dispatchId: string) {
  const startApp = encodeURIComponent(`dispatch_${dispatchId}`)
  const botUsername = String(config.telegramBotUsername || '').trim().replace(/^@/, '')
  const miniAppShortName = String(config.telegramMiniAppShortName || '').trim()

  const tMeDirectUrl =
    botUsername && miniAppShortName ? `https://t.me/${botUsername}/${miniAppShortName}?startapp=${startApp}` : undefined
  const tMeMainUrl = botUsername ? `https://t.me/${botUsername}?startapp=${startApp}` : undefined

  if (tMeDirectUrl) return { url: tMeDirectUrl }
  if (tMeMainUrl) return { url: tMeMainUrl }
  if (config.miniAppBaseUrl) {
    const base = String(config.miniAppBaseUrl).replace(/\/+$/, '')
    return { url: `${base}/master/dispatches/${dispatchId}?dispatch_id=${dispatchId}` }
  }
  return null
}

export async function createAndSendDispatch(event: H3Event, request: DispatchableRequest) {
  if (request.current_dispatch_attempt >= 3) {
    apiError(409, 'dispatch.max_attempts_exhausted', 'Max dispatch attempts exhausted')
  }

  const supabase = getSupabaseAdmin(event)
  const config = useRuntimeConfig(event)
  if (!config.telegramBotToken || !config.telegramMastersGroupId || Number(config.telegramMastersGroupId) === 0) {
    apiError(500, 'config.missing', 'TELEGRAM_BOT_TOKEN or TELEGRAM_MASTERS_GROUP_ID is missing')
  }

  const attemptNo = request.current_dispatch_attempt + 1
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
  const { data: dispatch, error: dispatchError } = await supabase
    .from('dispatch_records')
    .insert({
      request_id: request.id,
      attempt_no: attemptNo,
      telegram_group_id: Number(config.telegramMastersGroupId || 0),
      status: 'pending_send',
      expires_at: expiresAt
    })
    .select('id, status, expires_at')
    .single()

  if (dispatchError || !dispatch) {
    apiError(500, 'db.failed', 'Failed to create dispatch record', { reason: dispatchError?.message })
  }

  const previewText = await buildDispatchPreviewText(event, {
    public_code: request.public_code,
    domain_id: request.domain_id,
    problem_summary: request.problem_summary,
    visit_time_mode: request.visit_time_mode,
    visit_time_at: request.visit_time_at,
    locale: request.locale
  })

  const claimButton = buildClaimButton(config, dispatch.id)
  const claimButtonText = request.locale === 'ru' ? 'Принять заказ' : 'Буюртмани қабул қилиш'
  const sent = await sendTelegramDispatchMessage(
    config.telegramBotToken,
    Number(config.telegramMastersGroupId),
    previewText,
    claimButton ? { text: claimButtonText, ...claimButton } : undefined
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

  const { error: requestUpdateError } = await supabase
    .from('service_requests')
    .update({
      status: 'dispatched',
      current_dispatch_attempt: attemptNo
    })
    .eq('id', request.id)

  if (requestUpdateError) {
    apiError(500, 'db.failed', 'Failed to update request status', { reason: requestUpdateError.message })
  }

  return {
    request_id: request.id,
    dispatch_id: dispatch.id,
    status: 'dispatched' as const,
    expires_at: dispatch.expires_at
  }
}

export async function createPendingDispatchReview(event: H3Event, request: { id: string; requester_id: string }) {
  const supabase = getSupabaseAdmin(event)
  const { data: existing, error: lookupError } = await supabase
    .from('admin_dispatch_reviews')
    .select('id')
    .eq('request_id', request.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (lookupError) {
    apiError(500, 'db.failed', 'Failed to lookup admin dispatch review', { reason: lookupError.message })
  }

  if (existing) return existing.id

  const { data: review, error: reviewError } = await supabase
    .from('admin_dispatch_reviews')
    .insert({
      request_id: request.id,
      requester_id: request.requester_id
    })
    .select('id')
    .single()

  if (reviewError || !review) {
    apiError(500, 'db.failed', 'Failed to create admin dispatch review', { reason: reviewError?.message })
  }

  return review.id
}
