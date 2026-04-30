import { defineEventHandler } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireAdminSession } from '~~/server/utils/admin-auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const supabase = getSupabaseAdmin(event)

  const baseSelect = `
      id, status, reason_text, created_at, reviewed_at, request_id, requester_id,
      service_requests(id, public_code, status, problem_summary, phone_e164, address_text),
      users!admin_cancel_requests_requester_id_fkey(id, display_name, phone_e164, telegram_user_id)
    `

  const { data: pendingItems, error: pendingError } = await supabase
    .from('admin_cancel_requests')
    .select(baseSelect)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (pendingError) {
    apiError(500, 'db.failed', 'Failed to load pending cancel requests', { reason: pendingError.message })
  }

  const { data: historyItems, error: historyError } = await supabase
    .from('admin_cancel_requests')
    .select(baseSelect)
    .in('status', ['approved', 'rejected'])
    .order('reviewed_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(100)

  if (historyError) {
    apiError(500, 'db.failed', 'Failed to load cancel request history', { reason: historyError.message })
  }

  return ok({
    pending: pendingItems || [],
    history: historyItems || []
  })
})
