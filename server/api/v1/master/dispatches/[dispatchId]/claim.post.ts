import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { hashRequestPayload, requireUserContext } from '~~/server/utils/auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

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
  let ctx = await requireUserContext(event)
  const supabase = getSupabaseAdmin(event)
  if (!ctx.roles.is_master && config.public.allowDevAuthBypass) {
    const { error: approveError } = await supabase
      .from('master_profiles')
      .upsert(
        {
          user_id: ctx.user.id,
          approval_status: 'approved',
          is_active: true,
          approved_by: ctx.user.id,
          approved_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      )
    if (!approveError) {
      ctx = await requireUserContext(event)
    }
  }
  if (!ctx.roles.is_master) {
    apiError(403, 'master.not_approved', 'Master is not approved')
  }

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

  return ok({
    ...data.data
  })
})
