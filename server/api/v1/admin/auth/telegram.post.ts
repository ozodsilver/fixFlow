import { defineEventHandler } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireUserContext } from '~~/server/utils/auth'
import { setAdminSessionCookie } from '~~/server/utils/admin-auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

function parseAdminTelegramIds(value: string) {
  return new Set(
    value
      .split(',')
      .map(item => Number(item.trim()))
      .filter(item => Number.isFinite(item) && item > 0)
  )
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const ctx = await requireUserContext(event)
  const supabase = getSupabaseAdmin(event)

  const allowedTelegramIds = parseAdminTelegramIds(String(config.adminTelegramUserIds || ''))
  const isAllowlisted = allowedTelegramIds.has(ctx.user.telegram_user_id)

  const { data: existingAdmin, error: lookupError } = await supabase
    .from('admin_profiles')
    .select('user_id')
    .eq('user_id', ctx.user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (lookupError) {
    apiError(500, 'db.failed', 'Failed to check admin profile', { reason: lookupError.message })
  }

  if (!existingAdmin && !isAllowlisted) {
    apiError(403, 'access.forbidden', 'Telegram user is not allowed as admin')
  }

  if (!existingAdmin && isAllowlisted) {
    const { error: upsertError } = await supabase
      .from('admin_profiles')
      .upsert(
        {
          user_id: ctx.user.id,
          is_active: true,
          granted_by: ctx.user.id
        },
        { onConflict: 'user_id' }
      )

    if (upsertError) {
      apiError(500, 'db.failed', 'Failed to grant admin profile', { reason: upsertError.message })
    }
  }

  const adminLogin = String(config.adminLogin || '').trim()
  if (!adminLogin) {
    apiError(500, 'config.missing', 'ADMIN_LOGIN is missing')
  }

  setAdminSessionCookie(event, adminLogin)
  return ok({ ok: true })
})
