import { createError } from 'h3'

export function ok<T>(data: T) {
  return { data }
}

export function apiError(statusCode: number, code: string, message: string, details: Record<string, unknown> = {}) {
  throw createError({
    statusCode,
    statusMessage: message,
    data: {
      error: {
        code,
        message,
        details
      }
    }
  })
}
