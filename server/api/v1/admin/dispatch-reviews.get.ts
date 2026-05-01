import { defineEventHandler } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireAdminSession } from '~~/server/utils/admin-auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const supabase = getSupabaseAdmin(event)

  const select = `
    id, status, created_at, reviewed_at, request_id, requester_id,
    service_requests(id, public_code, status, problem_summary, phone_e164, address_text, urgency, visit_time_mode, visit_time_at),
    users!admin_dispatch_reviews_requester_id_fkey(id, display_name, phone_e164, telegram_user_id)
  `

  const { data: pending, error: pendingError } = await supabase
    .from('admin_dispatch_reviews')
    .select(select)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (pendingError) {
    apiError(500, 'db.failed', 'Failed to load pending dispatch reviews', { reason: pendingError.message })
  }

  const { data: history, error: historyError } = await supabase
    .from('admin_dispatch_reviews')
    .select(select)
    .neq('status', 'pending')
    .order('reviewed_at', { ascending: false })
    .limit(30)

  if (historyError) {
    apiError(500, 'db.failed', 'Failed to load dispatch review history', { reason: historyError.message })
  }

  return ok({ pending: pending || [], history: history || [] })
})
