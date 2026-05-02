import type { H3Event } from 'h3'
import { apiError } from './api'
import { requireUserContext } from './auth'
import { getSupabaseAdmin } from './supabase-admin'

export async function requireMasterContext(event: H3Event) {
  const config = useRuntimeConfig(event)
  const supabase = getSupabaseAdmin(event)
  let ctx = await requireUserContext(event)

  if (!ctx.roles.is_master && config.public.allowDevAuthBypass) {
    const { error } = await supabase
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

    if (!error) {
      ctx = await requireUserContext(event)
    }
  }

  if (!ctx.roles.is_master) {
    apiError(403, 'master.not_approved', 'Master is not approved')
  }

  return { ctx, supabase }
}
