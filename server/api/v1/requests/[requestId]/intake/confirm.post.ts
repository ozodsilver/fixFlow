import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireOwnedRequest } from '~~/server/utils/auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'
import { computeMissingFields } from '~~/server/utils/intake'

interface ConfirmBody {
  confirm?: boolean
}

export default defineEventHandler(async (event) => {
  const requestId = getRouterParam(event, 'requestId')
  const body = await readBody<ConfirmBody>(event)

  if (!requestId) {
    apiError(422, 'validation.failed', 'requestId is required')
  }

  if (!body.confirm) {
    apiError(422, 'validation.failed', 'confirm=true is required')
  }

  const { request } = await requireOwnedRequest(event, requestId)
  const supabase = getSupabaseAdmin(event)

  const missing = computeMissingFields({
    domain_id: request.domain_id,
    issue_tag_id: request.issue_tag_id,
    issue_custom: request.issue_custom,
    problem_summary: request.problem_summary,
    phone_e164: request.phone_e164,
    address_text: request.address_text,
    address_lat: request.address_lat,
    address_lng: request.address_lng,
    landmark_text: request.landmark_text,
    urgency: request.urgency,
    visit_time_mode: request.visit_time_mode,
    visit_time_at: request.visit_time_at,
    consent_share: request.consent_share
  })

  if (missing.length > 0) {
    apiError(409, 'request.not_dispatchable', 'Request is not ready for dispatch', { missing_required: missing })
  }

  const { data, error } = await supabase
    .from('service_requests')
    .update({ status: 'ready_for_dispatch' })
    .eq('id', request.id)
    .select('status')
    .single()

  if (error || !data) {
    apiError(500, 'db.failed', 'Failed to confirm intake', { reason: error?.message })
  }

  return ok({
    status: data.status,
    missing_required: []
  })
})
