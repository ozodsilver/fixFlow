import { defineEventHandler } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireUserContext } from '~~/server/utils/auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserContext(event)
  const supabase = getSupabaseAdmin(event)

  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    apiError(500, 'db.failed', 'Failed to load requests', { reason: error.message })
  }

  return ok({ items: data || [] })
})
