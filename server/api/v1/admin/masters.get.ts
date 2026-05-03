import { defineEventHandler, getQuery } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireAdminSession } from '~~/server/utils/admin-auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const supabase = getSupabaseAdmin(event)
  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''

  let request = supabase
    .from('users')
    .select(`
      id, telegram_user_id, display_name, username, phone_e164, locale, is_blocked, last_seen_at, created_at,
      master_profiles!master_profiles_user_id_fkey(
        approval_status, is_active, approved_at, revoked_at, created_at, updated_at
      )
    `)
    .order('last_seen_at', { ascending: false, nullsFirst: false })
    .limit(120)

  if (search) {
    request = request.or(`display_name.ilike.%${search}%,username.ilike.%${search}%,phone_e164.ilike.%${search}%`)
  }

  const { data, error } = await request
  if (error) {
    apiError(500, 'db.failed', 'Failed to load masters', { reason: error.message })
  }

  return ok({ items: data || [] })
})
