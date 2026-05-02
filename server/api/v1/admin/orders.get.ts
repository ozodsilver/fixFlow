import { defineEventHandler, getQuery } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireAdminSession } from '~~/server/utils/admin-auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const supabase = getSupabaseAdmin(event)
  const query = getQuery(event)
  const status = typeof query.status === 'string' ? query.status : ''

  let request = supabase
    .from('orders')
    .select(`
      id, request_id, status, final_price_amount, commission_percent, commission_amount, commission_status,
      commission_paid_at, admin_note, completed_at, completed_by_admin_at, canceled_at, created_at, updated_at,
      service_requests!orders_request_id_fkey(
        id, public_code, status, problem_summary, phone_e164, address_text, visit_time_mode, visit_time_at,
        users!service_requests_requester_id_fkey(id, display_name, phone_e164, telegram_user_id)
      ),
      order_assignments(
        id, master_id, status, is_current, assigned_at, ended_at,
        users!order_assignments_master_id_fkey(id, display_name, phone_e164, telegram_user_id)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(80)

  if (status) {
    request = request.eq('status', status)
  }

  const { data, error } = await request
  if (error) {
    apiError(500, 'db.failed', 'Failed to load orders', { reason: error.message })
  }

  return ok({ items: data || [] })
})
