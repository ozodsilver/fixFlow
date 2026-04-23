import { defineEventHandler } from 'h3'
import { ok } from '~~/server/utils/api'
import { requireUserContext } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const ctx = await requireUserContext(event)

  return ok({
    user: ctx.user,
    roles: ctx.roles,
    config: {
      default_locale: 'uz_cyrl',
      max_dispatch_attempts: 3
    }
  })
})
