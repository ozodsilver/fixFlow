import { defineEventHandler, getRouterParam } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireMasterContext } from '~~/server/utils/master-auth'

export default defineEventHandler(async (event) => {
  const dispatchId = getRouterParam(event, 'dispatchId')
  if (!dispatchId) {
    apiError(422, 'validation.failed', 'dispatchId is required')
  }

  const { ctx, supabase } = await requireMasterContext(event)

  const { data: dispatch, error } = await supabase
    .from('dispatch_records')
    .select(`
      id, status, expires_at, claimed_by_master_id, request_id,
      service_requests!dispatch_records_request_id_fkey(
        id, public_code, status, issue_custom, problem_summary, phone_e164, address_text, landmark_text,
        domain_id, urgency, visit_time_mode, visit_time_at, locale
      )
    `)
    .eq('id', dispatchId)
    .single()

  if (error || !dispatch || !dispatch.service_requests) {
    apiError(404, 'request.not_found', 'Dispatch not found')
  }

  const request = Array.isArray(dispatch.service_requests) ? dispatch.service_requests[0] : dispatch.service_requests
  const isClaimedByCurrentMaster = dispatch.claimed_by_master_id === ctx.user.id

  const masked = {
    ...request,
    phone_e164: isClaimedByCurrentMaster ? request.phone_e164 : null,
    address_text: isClaimedByCurrentMaster ? request.address_text : null,
    landmark_text: isClaimedByCurrentMaster ? request.landmark_text : null
  }

  return ok({
    dispatch: {
      id: dispatch.id,
      status: dispatch.status,
      expires_at: dispatch.expires_at,
      claimed_by_master_id: dispatch.claimed_by_master_id,
      is_claimed_by_current_master: isClaimedByCurrentMaster,
      request: masked
    }
  })
})
