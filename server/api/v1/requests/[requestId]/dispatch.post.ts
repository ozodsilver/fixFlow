import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireOwnedRequest } from '~~/server/utils/auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'
import { computeMissingFields } from '~~/server/utils/intake'

interface DispatchBody {
  idempotency_key?: string
}

export default defineEventHandler(async (event) => {
  const requestId = getRouterParam(event, 'requestId')
  const body = await readBody<DispatchBody>(event)

  if (!requestId) {
    apiError(422, 'validation.failed', 'requestId is required')
  }

  if (!body.idempotency_key) {
    apiError(422, 'validation.failed', 'idempotency_key is required')
  }

  const { request } = await requireOwnedRequest(event, requestId)
  const supabase = getSupabaseAdmin(event)
  const config = useRuntimeConfig(event)

  const missing = computeMissingFields({
    domain_id: request.domain_id,
    issue_tag_id: request.issue_tag_id,
    issue_custom: request.issue_custom,
    problem_summary: request.problem_summary,
    phone_e164: request.phone_e164,
    address_text: request.address_text,
    landmark_text: request.landmark_text,
    urgency: request.urgency,
    visit_time_mode: request.visit_time_mode,
    visit_time_at: request.visit_time_at,
    consent_share: request.consent_share
  })

  if (missing.length > 0) {
    apiError(409, 'request.not_dispatchable', 'Request is not dispatchable', { missing_required: missing })
  }

  if (request.current_dispatch_attempt >= 3) {
    apiError(409, 'dispatch.max_attempts_exhausted', 'Max dispatch attempts exhausted')
  }

  const attemptNo = request.current_dispatch_attempt + 1
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  const { data: dispatch, error: dispatchError } = await supabase
    .from('dispatch_records')
    .insert({
      request_id: request.id,
      attempt_no: attemptNo,
      telegram_group_id: Number(config.telegramMastersGroupId || 0),
      status: 'open',
      expires_at: expiresAt
    })
    .select('id, status, expires_at')
    .single()

  if (dispatchError || !dispatch) {
    apiError(500, 'db.failed', 'Failed to create dispatch record', { reason: dispatchError?.message })
  }

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

  return ok({
    request_id: request.id,
    dispatch_id: dispatch.id,
    status: 'dispatched',
    expires_at: dispatch.expires_at
  })
})
