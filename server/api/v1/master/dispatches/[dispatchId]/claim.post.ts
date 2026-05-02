import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { hashRequestPayload } from '~~/server/utils/auth'
import { requireMasterContext } from '~~/server/utils/master-auth'
import { buildMasterClaimNotificationText, sendTelegramUserMessage } from '~~/server/utils/telegram-dispatch'

interface ClaimBody {
  idempotency_key?: string
}

export default defineEventHandler(async (event) => {
  const dispatchId = getRouterParam(event, 'dispatchId')
  if (!dispatchId) {
    apiError(422, 'validation.failed', 'dispatchId is required')
  }

  const body = await readBody<ClaimBody>(event)
  if (!body.idempotency_key) {
    apiError(422, 'validation.failed', 'idempotency_key is required')
  }

  const config = useRuntimeConfig(event)
  const { ctx, supabase } = await requireMasterContext(event)

  const requestHash = hashRequestPayload({ dispatch_id: dispatchId, master_user_id: ctx.user.id })

  const { data, error } = await supabase.rpc('rpc_claim_dispatch', {
    p_dispatch_id: dispatchId,
    p_master_user_id: ctx.user.id,
    p_idempotency_key: body.idempotency_key,
    p_request_hash: requestHash,
    p_ip: null,
    p_user_agent: event.node.req.headers['user-agent'] || null
  })

  if (error || !data) {
    apiError(500, 'db.failed', 'Claim RPC failed', { reason: error?.message })
  }

  if (!data.ok) {
    const errCode = data.error?.code || 'dispatch.claim_conflict'
    const errMessage = data.error?.message || 'Dispatch claim failed'
    apiError(409, errCode, errMessage)
  }

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id,
      service_requests!orders_request_id_fkey(
        public_code, problem_summary, phone_e164, address_text, landmark_text, visit_time_mode, visit_time_at, locale,
        users!service_requests_requester_id_fkey(display_name)
      )
    `)
    .eq('id', data.data.order_id)
    .maybeSingle()

  const request = Array.isArray(order?.service_requests) ? order?.service_requests[0] : order?.service_requests
  if (config.telegramBotToken && request) {
    const miniAppUrl = config.miniAppBaseUrl
      ? `${String(config.miniAppBaseUrl).replace(/\/+$/, '')}/master/orders/${data.data.order_id}`
      : ''
    const requester = Array.isArray(request.users) ? request.users[0] : request.users
    const sent = await sendTelegramUserMessage(
      config.telegramBotToken,
      ctx.user.telegram_user_id,
      buildMasterClaimNotificationText({
        public_code: request.public_code,
        requester_name: requester?.display_name,
        phone_e164: request.phone_e164,
        address_text: request.address_text,
        landmark_text: request.landmark_text,
        problem_summary: request.problem_summary,
        visit_time_mode: request.visit_time_mode,
        visit_time_at: request.visit_time_at,
        locale: request.locale
      }),
      miniAppUrl ? { text: request.locale === 'ru' ? 'Открыть заказ' : 'Буюртмани очиш', url: miniAppUrl } : undefined
    )
    if (!sent.ok) {
      console.warn('telegram.master_claim_notify_failed', sent.error)
    }
  }

  return ok({ ...data.data })
})
