import { defineEventHandler, getRouterParam } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireOwnedRequest } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const requestId = getRouterParam(event, 'requestId')
  if (!requestId) {
    apiError(422, 'validation.failed', 'requestId is required')
  }

  const { request } = await requireOwnedRequest(event, requestId)
  return ok(request)
})
