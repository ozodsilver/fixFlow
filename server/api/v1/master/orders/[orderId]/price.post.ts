import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireMasterContext } from '~~/server/utils/master-auth'

interface UpdateMasterOrderPriceBody {
  final_price_amount?: number
}

export default defineEventHandler(async (event) => {
  const orderId = getRouterParam(event, 'orderId')
  if (!orderId) apiError(422, 'validation.failed', 'orderId is required')

  const body = await readBody<UpdateMasterOrderPriceBody>(event)
  const finalPriceAmount = Number(body.final_price_amount)
  if (!Number.isInteger(finalPriceAmount) || finalPriceAmount <= 0) {
    apiError(422, 'validation.failed', 'final_price_amount must be a positive integer')
  }

  const { ctx, supabase } = await requireMasterContext(event)
  const { data: assignment, error: assignmentError } = await supabase
    .from('order_assignments')
    .select(`
      id, status, is_current,
      orders!order_assignments_order_id_fkey(
        id, status, final_price_amount, commission_status
      )
    `)
    .eq('order_id', orderId)
    .eq('master_id', ctx.user.id)
    .maybeSingle()

  if (assignmentError) {
    apiError(500, 'db.failed', 'Failed to verify master order', { reason: assignmentError.message })
  }
  if (!assignment) {
    apiError(404, 'request.not_found', 'Order not found')
  }

  const assignmentRow = assignment as any
  const order = Array.isArray(assignmentRow.orders) ? assignmentRow.orders[0] : assignmentRow.orders
  if (!order) {
    apiError(404, 'request.not_found', 'Order not found')
  }
  if (order.status === 'completed' || order.status === 'canceled_admin') {
    apiError(409, 'order.closed', 'Order is already closed')
  }
  if (order.commission_status === 'paid') {
    apiError(409, 'order.commission_paid', 'Commission is already accepted by admin')
  }

  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update({
      final_price_amount: finalPriceAmount,
      status: order.status === 'accepted' ? 'in_progress' : order.status
    })
    .eq('id', orderId)
    .select('id, status, final_price_amount, commission_percent, commission_amount, commission_status, completed_at, updated_at')
    .single()

  if (updateError || !updatedOrder) {
    apiError(500, 'db.failed', 'Failed to update order price', { reason: updateError?.message })
  }
  const updatedOrderRow = updatedOrder as any

  await Promise.allSettled([
    supabase.from('status_history').insert({
      entity_type: 'order',
      entity_id: orderId,
      from_status: order.status,
      to_status: updatedOrderRow.status,
      actor_user_id: ctx.user.id,
      actor_role: 'master',
      reason: 'master_submitted_final_price',
      meta: {
        final_price_amount: updatedOrderRow.final_price_amount,
        commission_amount: updatedOrderRow.commission_amount
      }
    }),
    supabase.from('audit_logs').insert({
      actor_user_id: ctx.user.id,
      action: 'order.final_price_submitted',
      entity_type: 'order',
      entity_id: orderId,
      meta: {
        final_price_amount: updatedOrderRow.final_price_amount,
        commission_amount: updatedOrderRow.commission_amount,
        commission_status: updatedOrderRow.commission_status
      }
    })
  ])

  return ok({ order: updatedOrderRow })
})
