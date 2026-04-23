import { defineEventHandler, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'
import { setSessionCookie } from '~~/server/utils/session'
import { verifyTelegramInitData } from '~~/server/utils/auth'

interface InitBody {
  init_data?: string
  locale?: 'uz_cyrl' | 'ru'
  telegram_user_id?: number
  display_name?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody<InitBody>(event)
  const supabase = getSupabaseAdmin(event)

  let telegramUserId: number | null = null
  let displayName: string | null = null
  let username: string | null = null

  if (body.init_data) {
    if (!config.telegramBotToken) {
      apiError(500, 'config.missing', 'TELEGRAM_BOT_TOKEN is not configured')
    }

    const parsedUser = verifyTelegramInitData(body.init_data, config.telegramBotToken)
    if (!parsedUser?.id) {
      apiError(401, 'auth.invalid_init_data', 'Invalid Telegram init data')
    }

    telegramUserId = parsedUser.id
    displayName = [parsedUser.first_name, parsedUser.last_name].filter(Boolean).join(' ').trim() || `User ${parsedUser.id}`
    username = parsedUser.username ?? null
  }
  else if (config.public.allowDevAuthBypass && body.telegram_user_id) {
    telegramUserId = body.telegram_user_id
    displayName = body.display_name?.trim() || `Dev User ${body.telegram_user_id}`
    username = null
  }

  if (!telegramUserId || !displayName) {
    apiError(401, 'auth.invalid_init_data', 'Auth payload is invalid')
  }

  const locale = body.locale === 'ru' ? 'ru' : 'uz_cyrl'

  const { data: user, error: upsertError } = await supabase
    .from('users')
    .upsert(
      {
        telegram_user_id: telegramUserId,
        display_name: displayName,
        username,
        locale,
        last_seen_at: new Date().toISOString()
      },
      { onConflict: 'telegram_user_id' }
    )
    .select('id, telegram_user_id, display_name, username, locale')
    .single()

  if (upsertError || !user) {
    apiError(500, 'db.failed', 'Failed to create or update user', { reason: upsertError?.message })
  }

  const [{ data: masterProfile }, { data: adminProfile }] = await Promise.all([
    supabase
      .from('master_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('approval_status', 'approved')
      .eq('is_active', true)
      .maybeSingle(),
    supabase.from('admin_profiles').select('user_id').eq('user_id', user.id).eq('is_active', true).maybeSingle()
  ])

  const exp = setSessionCookie(event, user.id, user.telegram_user_id)

  return ok({
    session_expires_at: new Date(exp * 1000).toISOString(),
    user,
    roles: {
      is_master: !!masterProfile,
      is_admin: !!adminProfile
    }
  })
})
