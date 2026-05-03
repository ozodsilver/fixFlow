import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireAdminSession } from '~~/server/utils/admin-auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

interface MasterStatusBody {
  status?: 'pending' | 'approved' | 'revoked'
  is_active?: boolean
}

const allowedStatuses = new Set(['pending', 'approved', 'revoked'])

export default defineEventHandler(async (event) => {
  const admin = requireAdminSession(event)
  const userId = getRouterParam(event, 'userId')
  if (!userId) apiError(422, 'validation.failed', 'userId is required')

  const body = await readBody<MasterStatusBody>(event)
  if (!body.status || !allowedStatuses.has(body.status)) {
    apiError(422, 'validation.failed', 'status must be pending, approved, or revoked')
  }

  const supabase = getSupabaseAdmin(event)
  const { data: targetUser, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()

  if (userError || !targetUser) {
    apiError(404, 'request.not_found', 'User not found')
  }

  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('user_id')
    .eq('is_active', true)
    .order('granted_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const actorUserId = adminProfile?.user_id || userId
  const now = new Date().toISOString()
  const patch: Record<string, unknown> = {
    user_id: userId,
    approval_status: body.status,
    is_active: body.status === 'approved' ? (body.is_active ?? true) : false
  }

  if (body.status === 'approved') {
    patch.approved_by = actorUserId
    patch.approved_at = now
    patch.revoked_by = null
    patch.revoked_at = null
  }
  else if (body.status === 'revoked') {
    patch.revoked_by = actorUserId
    patch.revoked_at = now
  }
  else {
    patch.approved_by = null
    patch.approved_at = null
    patch.revoked_by = null
    patch.revoked_at = null
  }

  const { data: profile, error } = await supabase
    .from('master_profiles')
    .upsert(patch, { onConflict: 'user_id' })
    .select('*')
    .single()

  if (error || !profile) {
    apiError(500, 'db.failed', 'Failed to update master status', { reason: error?.message })
  }

  await supabase.from('audit_logs').insert({
    actor_user_id: adminProfile?.user_id || null,
    action: `master.${body.status}`,
    entity_type: 'master_profile',
    entity_id: userId,
    meta: { admin_login: admin.login, target_user_id: userId }
  }).then(() => undefined)

  return ok({ profile })
})
