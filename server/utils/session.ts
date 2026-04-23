import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie } from 'h3'
import { apiError } from './api'

const COOKIE_NAME = 'ff_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24

interface SessionPayload {
  uid: string
  tgid: number
  exp: number
}

function toBase64Url(value: Buffer | string) {
  return Buffer.from(value).toString('base64url')
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function signPayload(encodedPayload: string, secret: string) {
  return toBase64Url(createHmac('sha256', secret).update(encodedPayload).digest())
}

export function createSessionToken(payload: SessionPayload, secret: string) {
  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const signature = signPayload(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

export function verifySessionToken(token: string, secret: string): SessionPayload | null {
  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) return null

  const expected = signPayload(encodedPayload, secret)

  const sigBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  }
  catch {
    return null
  }
}

export function setSessionCookie(event: H3Event, userId: string, telegramUserId: number) {
  const config = useRuntimeConfig(event)
  if (!config.sessionSecret) {
    apiError(500, 'config.missing', 'SESSION_SECRET is missing')
  }

  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const token = createSessionToken({ uid: userId, tgid: telegramUserId, exp }, config.sessionSecret)

  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  })

  return exp
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function getSessionPayload(event: H3Event): SessionPayload {
  const config = useRuntimeConfig(event)
  if (!config.sessionSecret) {
    apiError(500, 'config.missing', 'SESSION_SECRET is missing')
  }

  const token = getCookie(event, COOKIE_NAME)
  if (!token) {
    apiError(401, 'auth.session_expired', 'Session expired')
  }

  const payload = verifySessionToken(token, config.sessionSecret)
  if (!payload) {
    clearSessionCookie(event)
    apiError(401, 'auth.session_expired', 'Session expired')
  }

  return payload
}
