import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { apiError } from './api'
import { getSupabaseAdmin } from './supabase-admin'
import { getSessionPayload } from './session'

interface TelegramInitUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
}

interface UserContext {
  user: {
    id: string
    telegram_user_id: number
    display_name: string
    username: string | null
    locale: 'uz_cyrl' | 'ru'
  }
  roles: {
    is_master: boolean
    is_admin: boolean
  }
}

export function hashRequestPayload(payload: unknown) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

export function verifyTelegramInitData(initData: string, botToken: string) {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')

  if (!hash) {
    return null
  }

  params.delete('hash')

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const calculatedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  const hashBuffer = Buffer.from(hash, 'hex')
  const calculatedBuffer = Buffer.from(calculatedHash, 'hex')

  if (hashBuffer.length !== calculatedBuffer.length || !timingSafeEqual(hashBuffer, calculatedBuffer)) {
    return null
  }

  const authDate = Number(params.get('auth_date'))
  const now = Math.floor(Date.now() / 1000)
  if (!authDate || Math.abs(now - authDate) > 86400) {
    return null
  }

  const rawUser = params.get('user')
  if (!rawUser) return null

  try {
    return JSON.parse(rawUser) as TelegramInitUser
  }
  catch {
    return null
  }
}

export async function requireUserContext(event: H3Event): Promise<UserContext> {
  const session = getSessionPayload(event)
  const supabase = getSupabaseAdmin(event)

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, telegram_user_id, display_name, username, locale, is_blocked')
    .eq('id', session.uid)
    .single()

  if (userError || !user) {
    apiError(401, 'auth.session_expired', 'Session expired')
  }

  if (user.is_blocked) {
    apiError(403, 'access.forbidden', 'User is blocked')
  }

  const [{ data: masterProfile }, { data: adminProfile }] = await Promise.all([
    supabase
      .from('master_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('approval_status', 'approved')
      .eq('is_active', true)
      .maybeSingle(),
    supabase
      .from('admin_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()
  ])

  return {
    user: {
      id: user.id,
      telegram_user_id: user.telegram_user_id,
      display_name: user.display_name,
      username: user.username,
      locale: user.locale
    },
    roles: {
      is_master: !!masterProfile,
      is_admin: !!adminProfile
    }
  }
}

export async function requireOwnedRequest(event: H3Event, requestId: string) {
  const ctx = await requireUserContext(event)
  const supabase = getSupabaseAdmin(event)

  const { data: request, error } = await supabase
    .from('service_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (error || !request) {
    apiError(404, 'request.not_found', 'Request not found')
  }

  if (request.requester_id !== ctx.user.id) {
    apiError(403, 'request.not_owner', 'Request does not belong to current user')
  }

  return { ctx, request }
}
