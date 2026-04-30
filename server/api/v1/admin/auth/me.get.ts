import { defineEventHandler } from 'h3'
import { ok } from '~~/server/utils/api'
import { requireAdminSession } from '~~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  const session = requireAdminSession(event)
  return ok({ login: session.login })
})
