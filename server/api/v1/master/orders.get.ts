import { defineEventHandler } from 'h3'
import { ok, apiError } from '~~/server/utils/api'
import { requireMasterContext } from '~~/server/utils/master-auth'

export default defineEventHandler(async (event) => {
  const { ctx, supabase } = await requireMasterContext(event)

  const { data, error } = await supabase
    .from('order_assignments')
    .select(`
      id, status, is_current, assigned_at, ended_at,
      orders!order_assignments_order_id_fkey(
        id, status, final_price_amount, commission_percent, commission_amount, commission_status,
        completed_at, canceled_at, created_at,
        service_requests!orders_request_id_fkey(
          id, public_code, problem_summary, phone_e164, address_text, landmark_text,
          urgency, visit_time_mode, visit_time_at, locale
        )
      )
    `)
    .eq('master_id', ctx.user.id)
    .order('assigned_at', { ascending: false })
    .limit(80)

  if (error) {
    apiError(500, 'db.failed', 'Failed to load master orders', { reason: error.message })
  }

  return ok({ items: data || [] })
})
