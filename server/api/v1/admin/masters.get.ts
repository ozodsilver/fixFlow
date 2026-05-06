import { defineEventHandler, getQuery } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireAdminSession } from '~~/server/utils/admin-auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

interface MasterRow {
  approval_status: string
  is_active: boolean
  approved_at: string | null
  revoked_at: string | null
  created_at: string
  updated_at: string
  users:
    | {
        id: string
        telegram_user_id: number
        display_name: string
        username: string | null
        phone_e164: string | null
        locale: string
        is_blocked: boolean
        last_seen_at: string | null
        created_at: string
      }
    | null
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const supabase = getSupabaseAdmin(event)
  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''

  let request = supabase
    .from('master_profiles')
    .select(`
      approval_status, is_active, approved_at, revoked_at, created_at, updated_at,
      users!master_profiles_user_id_fkey(
        id, telegram_user_id, display_name, username, phone_e164, locale, is_blocked, last_seen_at, created_at
      )
    `)
    .order('updated_at', { ascending: false })
    .limit(120)

  if (search) {
    request = request.or(
      `display_name.ilike.%${search}%,username.ilike.%${search}%,phone_e164.ilike.%${search}%`,
      { foreignTable: 'users' }
    )
  }

  const { data, error } = await request
  if (error) {
    apiError(500, 'db.failed', 'Failed to load masters', { reason: error.message })
  }

  const rows = (data || []) as unknown as MasterRow[]
  const items = rows
    .filter(row => row.users)
    .map((row) => {
      const user = row.users as NonNullable<MasterRow['users']>
      return {
        id: user.id,
        telegram_user_id: user.telegram_user_id,
        display_name: user.display_name,
        username: user.username,
        phone_e164: user.phone_e164,
        locale: user.locale,
        is_blocked: user.is_blocked,
        last_seen_at: user.last_seen_at,
        created_at: user.created_at,
        master_profiles: {
          approval_status: row.approval_status,
          is_active: row.is_active,
          approved_at: row.approved_at,
          revoked_at: row.revoked_at,
          created_at: row.created_at,
          updated_at: row.updated_at
        }
      }
    })

  return ok({ items })
})
