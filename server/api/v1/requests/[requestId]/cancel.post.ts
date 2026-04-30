import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireOwnedRequest } from '~~/server/utils/auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

interface CancelBody {
  reason?: string
}

const directCancelableStatuses = ['draft', 'intake_in_progress', 'ready_for_dispatch']
const adminReviewStatuses = ['dispatched', 'in_fulfillment']

export default defineEventHandler(async (event) => {
  const requestId = getRouterParam(event, 'requestId')
  await readBody<CancelBody>(event)

  if (!requestId) {
    apiError(422, 'validation.failed', 'requestId is required')
  }

  const { request } = await requireOwnedRequest(event, requestId)
  const supabase = getSupabaseAdmin(event)

  if (directCancelableStatuses.includes(request.status)) {
    const { data, error } = await supabase
      .from('service_requests')
      .update({
        status: 'closed_canceled_user',
        closed_reason: 'user_cancelled'
      })
      .eq('id', request.id)
      .select('status')
      .single()

    if (error || !data) {
      apiError(500, 'db.failed', 'Failed to cancel request', { reason: error?.message })
    }

    return ok({ status: data.status, admin_review_required: false })
  }

  if (!adminReviewStatuses.includes(request.status)) {
    apiError(409, 'request.not_dispatchable', 'Request cannot be canceled in current status')
  }

  const { data: existingPending, error: pendingLookupError } = await supabase
    .from('admin_cancel_requests')
    .select('id')
    .eq('request_id', request.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (pendingLookupError) {
    apiError(500, 'db.failed', 'Failed to lookup admin cancel request', { reason: pendingLookupError.message })
  }

  if (!existingPending) {
    const { error: adminRequestError } = await supabase
      .from('admin_cancel_requests')
      .insert({
        request_id: request.id,
        requester_id: request.requester_id,
        reason_text: 'requester_cancel_click',
        status: 'pending'
      })

    if (adminRequestError) {
      apiError(500, 'db.failed', 'Failed to create admin cancel request', { reason: adminRequestError.message })
    }
  }

  return ok({ status: request.status, admin_review_required: true })
})
