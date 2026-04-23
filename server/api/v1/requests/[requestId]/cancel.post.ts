import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireOwnedRequest } from '~~/server/utils/auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

interface CancelBody {
  reason?: string
}

const cancellableStatuses = ['draft', 'intake_in_progress', 'ready_for_dispatch', 'dispatched']

export default defineEventHandler(async (event) => {
  const requestId = getRouterParam(event, 'requestId')
  await readBody<CancelBody>(event)

  if (!requestId) {
    apiError(422, 'validation.failed', 'requestId is required')
  }

  const { request } = await requireOwnedRequest(event, requestId)
  const supabase = getSupabaseAdmin(event)

  if (!cancellableStatuses.includes(request.status)) {
    apiError(409, 'request.not_dispatchable', 'Request cannot be canceled in current status')
  }

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

  return ok({ status: data.status })
})
