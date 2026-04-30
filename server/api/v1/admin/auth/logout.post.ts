import { defineEventHandler } from 'h3'
import { ok } from '~~/server/utils/api'
import { clearAdminSessionCookie } from '~~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  clearAdminSessionCookie(event)
  return ok({ ok: true })
})
