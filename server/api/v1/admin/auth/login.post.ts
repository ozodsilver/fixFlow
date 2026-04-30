import { defineEventHandler, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { setAdminSessionCookie } from '~~/server/utils/admin-auth'

interface LoginBody {
  login?: string
  password?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginBody>(event)
  const config = useRuntimeConfig(event)

  const login = body.login?.trim() || ''
  const password = body.password || ''
  if (!login || !password) {
    apiError(422, 'validation.failed', 'login and password are required')
  }

  if (login !== (config.adminLogin || '').trim() || password !== (config.adminPassword || '')) {
    apiError(403, 'access.forbidden', 'Invalid admin credentials')
  }

  setAdminSessionCookie(event, login)
  return ok({ ok: true })
})
