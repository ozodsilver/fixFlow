import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireAdminSession } from '~~/server/utils/admin-auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

interface UpdateOrderBody {
  final_price_amount?: number | null
  commission_status?: 'not_set' | 'unpaid' | 'paid' | 'waived'
  admin_note?: string | null
  status?: 'accepted' | 'in_progress' | 'completed' | 'canceled_admin'
}

const allowedCommissionStatuses = new Set(['not_set', 'unpaid', 'paid', 'waived'])
const allowedStatuses = new Set(['accepted', 'in_progress', 'completed', 'canceled_admin'])

export default defineEventHandler(async (event) => {
  const admin = requireAdminSession(event)
  const adminSession = admin as NonNullable<typeof admin>
  const orderId = getRouterParam(event, 'orderId')
  if (!orderId) apiError(422, 'validation.failed', 'orderId is required')

  const body = await readBody<UpdateOrderBody>(event)
  const patch: Record<string, unknown> = {}

  if ('final_price_amount' in body) {
    const finalPriceAmount = body.final_price_amount
    if (finalPriceAmount !== null && finalPriceAmount !== undefined && (!Number.isInteger(finalPriceAmount) || finalPriceAmount < 0)) {
      apiError(422, 'validation.failed', 'final_price_amount must be a positive integer')
    }
    patch.final_price_amount = finalPriceAmount ?? null
  }

  if ('commission_status' in body) {
    if (!body.commission_status || !allowedCommissionStatuses.has(body.commission_status)) {
      apiError(422, 'validation.failed', 'commission_status is invalid')
    }
    patch.commission_status = body.commission_status
  }

  if ('admin_note' in body) {
    patch.admin_note = body.admin_note?.trim() ? body.admin_note.trim().slice(0, 500) : null
  }

  if ('status' in body) {
    if (!body.status || !allowedStatuses.has(body.status)) {
      apiError(422, 'validation.failed', 'status is invalid')
    }
    patch.status = body.status
    if (body.status === 'completed') {
      patch.completed_at = new Date().toISOString()
      patch.completed_by_admin_at = patch.completed_at
    }
    if (body.status === 'canceled_admin') {
      patch.canceled_at = new Date().toISOString()
    }
  }

  if (Object.keys(patch).length === 0) {
    apiError(422, 'validation.failed', 'No order changes provided')
  }

  const supabase = getSupabaseAdmin(event)
  const { data: current, error: lookupError } = await supabase
    .from('orders')
    .select('id, request_id, status, final_price_amount')
    .eq('id', orderId)
    .single()

  if (lookupError || !current) {
    apiError(404, 'request.not_found', 'Order not found')
  }
  const currentOrder = current as NonNullable<typeof current>

  const finalPriceForCompletion = 'final_price_amount' in patch
    ? patch.final_price_amount
    : currentOrder.final_price_amount
  if ((body.status === 'completed' || body.commission_status === 'paid') && !finalPriceForCompletion) {
    apiError(422, 'validation.failed', 'final_price_amount is required before accepting commission')
  }

  const { data: order, error: updateError } = await supabase
    .from('orders')
    .update(patch)
    .eq('id', orderId)
    .select('*')
    .single()

  if (updateError || !order) {
    apiError(500, 'db.failed', 'Failed to update order', { reason: updateError?.message })
  }

  if (body.status === 'completed') {
    await Promise.allSettled([
      supabase
        .from('service_requests')
        .update({ status: 'closed_completed' })
        .eq('id', currentOrder.request_id),
      supabase
        .from('order_assignments')
        .update({
          status: 'completed',
          is_current: false,
          ended_at: new Date().toISOString(),
          end_reason: 'completed_by_admin'
        })
        .eq('order_id', orderId)
        .eq('is_current', true),
      supabase.from('status_history').insert({
        entity_type: 'order',
        entity_id: orderId,
        from_status: currentOrder.status,
        to_status: 'completed',
        actor_role: 'admin',
        reason: `completed_by_${adminSession.login}`
      })
    ])
  }

  if (body.status === 'canceled_admin') {
    await Promise.allSettled([
      supabase
        .from('service_requests')
        .update({ status: 'closed_canceled_admin' })
        .eq('id', currentOrder.request_id),
      supabase
        .from('order_assignments')
        .update({
          status: 'released_by_admin',
          is_current: false,
          ended_at: new Date().toISOString(),
          end_reason: 'canceled_by_admin'
        })
        .eq('order_id', orderId)
        .eq('is_current', true),
      supabase.from('status_history').insert({
        entity_type: 'order',
        entity_id: orderId,
        from_status: currentOrder.status,
        to_status: 'canceled_admin',
        actor_role: 'admin',
        reason: `canceled_by_${adminSession.login}`
      })
    ])
  }

  return ok({ order })
})
