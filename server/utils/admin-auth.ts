import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { deleteCookie, getCookie, setCookie } from 'h3'
import { apiError } from './api'

const ADMIN_COOKIE = 'ff_admin_session'
const ADMIN_TTL_SECONDS = 60 * 60 * 12

interface AdminSessionPayload {
  login: string
  exp: number
}

function toBase64Url(value: Buffer | string) {
  return Buffer.from(value).toString('base64url')
}

function signPayload(encodedPayload: string, secret: string) {
  return toBase64Url(createHmac('sha256', secret).update(encodedPayload).digest())
}

function createAdminSessionToken(payload: AdminSessionPayload, secret: string) {
  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const signature = signPayload(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

function verifyAdminSessionToken(token: string, secret: string): AdminSessionPayload | null {
  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) return null

  const expected = signPayload(encodedPayload, secret)
  const sigBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as AdminSessionPayload
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  }
  catch {
    return null
  }
}

function getAdminSecret(event: H3Event) {
  const config = useRuntimeConfig(event)
  return (config.adminSessionSecret || config.sessionSecret || '').trim()
}

export function setAdminSessionCookie(event: H3Event, login: string) {
  const secret = getAdminSecret(event)
  if (!secret) apiError(500, 'config.missing', 'ADMIN_SESSION_SECRET is missing')

  const exp = Math.floor(Date.now() / 1000) + ADMIN_TTL_SECONDS
  const token = createAdminSessionToken({ login, exp }, secret)
  setCookie(event, ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_TTL_SECONDS
  })
}

export function clearAdminSessionCookie(event: H3Event) {
  deleteCookie(event, ADMIN_COOKIE, { path: '/' })
}

export function requireAdminSession(event: H3Event) {
  const config = useRuntimeConfig(event)
  const secret = getAdminSecret(event)
  if (!secret) apiError(500, 'config.missing', 'ADMIN_SESSION_SECRET is missing')

  const token = getCookie(event, ADMIN_COOKIE)
  if (!token) apiError(401, 'auth.session_expired', 'Admin session expired')

  const payload = verifyAdminSessionToken(token, secret)
  if (!payload) {
    clearAdminSessionCookie(event)
    apiError(401, 'auth.session_expired', 'Admin session expired')
  }

  const expectedLogin = (config.adminLogin || '').trim()
  if (!expectedLogin || payload.login !== expectedLogin) {
    apiError(403, 'access.forbidden', 'Admin access denied')
  }

  return payload
}
