import { defineEventHandler, getQuery, getRouterParam } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireOwnedRequest } from '~~/server/utils/auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

function parseLimit(raw: unknown) {
  if (typeof raw !== 'string' || !raw.trim()) return 80
  const value = Number.parseInt(raw, 10)
  if (!Number.isFinite(value)) return 80
  return Math.min(Math.max(value, 1), 200)
}

export default defineEventHandler(async (event) => {
  const requestId = getRouterParam(event, 'requestId')
  if (!requestId) {
    apiError(422, 'validation.failed', 'requestId is required')
  }

  await requireOwnedRequest(event, requestId)
  const supabase = getSupabaseAdmin(event)

  const query = getQuery(event)
  const limit = parseLimit(query.limit)

  const { data, error } = await supabase
    .from('request_intake_messages')
    .select('id, sender, message_text, validation_snapshot, offtopic, abuse, created_at')
    .eq('request_id', requestId)
    .order('id', { ascending: true })
    .limit(limit)

  if (error) {
    apiError(500, 'db.failed', 'Failed to load intake messages', { reason: error.message })
  }

  return ok({
    items: data || []
  })
})
