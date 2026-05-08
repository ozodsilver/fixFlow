import { defineEventHandler } from 'h3'
import { ok, apiError } from '~~/server/utils/api'
import { requireAdminSession } from '~~/server/utils/admin-auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const supabase = getSupabaseAdmin(event)

  // orders must be deleted first (service_requests has on delete restrict for orders FK)
  const { error: ordersError } = await supabase.from('orders').delete().not('id', 'is', null)
  if (ordersError) apiError(500, 'db.failed', 'Failed to reset orders before requests', { reason: ordersError.message })

  const { error: requestsError } = await supabase.from('service_requests').delete().not('id', 'is', null)
  if (requestsError) apiError(500, 'db.failed', 'Failed to reset service requests', { reason: requestsError.message })

  return ok({ deleted: true })
})
