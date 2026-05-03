globalThis.__timing__.logStart('Load chunks/routes/api/v1/admin/orders/_orderId/update.post');import { d as defineEventHandler, b as requireAdminSession, e as getRouterParam, a as apiError, r as readBody, g as getSupabaseAdmin, o as ok } from '../../../../../../nitro/nitro.mjs';
import 'node:crypto';
import '@supabase/supabase-js';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import '@iconify/utils';
import 'consola';
import 'node:url';
import 'ipx';

const allowedCommissionStatuses = /* @__PURE__ */ new Set(["not_set", "unpaid", "paid", "waived"]);
const allowedStatuses = /* @__PURE__ */ new Set(["accepted", "in_progress", "completed", "canceled_admin"]);
const update_post = defineEventHandler(async (event) => {
  var _a;
  const admin = requireAdminSession(event);
  const orderId = getRouterParam(event, "orderId");
  if (!orderId) apiError(422, "validation.failed", "orderId is required");
  const body = await readBody(event);
  const patch = {};
  if ("final_price_amount" in body) {
    if (body.final_price_amount !== null && (!Number.isInteger(body.final_price_amount) || body.final_price_amount < 0)) {
      apiError(422, "validation.failed", "final_price_amount must be a positive integer");
    }
    patch.final_price_amount = body.final_price_amount;
  }
  if ("commission_status" in body) {
    if (!body.commission_status || !allowedCommissionStatuses.has(body.commission_status)) {
      apiError(422, "validation.failed", "commission_status is invalid");
    }
    patch.commission_status = body.commission_status;
  }
  if ("admin_note" in body) {
    patch.admin_note = ((_a = body.admin_note) == null ? void 0 : _a.trim()) ? body.admin_note.trim().slice(0, 500) : null;
  }
  if ("status" in body) {
    if (!body.status || !allowedStatuses.has(body.status)) {
      apiError(422, "validation.failed", "status is invalid");
    }
    patch.status = body.status;
    if (body.status === "completed") {
      patch.completed_at = (/* @__PURE__ */ new Date()).toISOString();
      patch.completed_by_admin_at = patch.completed_at;
    }
    if (body.status === "canceled_admin") {
      patch.canceled_at = (/* @__PURE__ */ new Date()).toISOString();
    }
  }
  if (Object.keys(patch).length === 0) {
    apiError(422, "validation.failed", "No order changes provided");
  }
  const supabase = getSupabaseAdmin(event);
  const { data: current, error: lookupError } = await supabase.from("orders").select("id, request_id, status").eq("id", orderId).single();
  if (lookupError || !current) {
    apiError(404, "request.not_found", "Order not found");
  }
  const { data: order, error: updateError } = await supabase.from("orders").update(patch).eq("id", orderId).select("*").single();
  if (updateError || !order) {
    apiError(500, "db.failed", "Failed to update order", { reason: updateError == null ? void 0 : updateError.message });
  }
  if (body.status === "completed") {
    await Promise.allSettled([
      supabase.from("service_requests").update({ status: "closed_completed" }).eq("id", current.request_id),
      supabase.from("order_assignments").update({
        status: "completed",
        is_current: false,
        ended_at: (/* @__PURE__ */ new Date()).toISOString(),
        end_reason: "completed_by_admin"
      }).eq("order_id", orderId).eq("is_current", true),
      supabase.from("status_history").insert({
        entity_type: "order",
        entity_id: orderId,
        from_status: current.status,
        to_status: "completed",
        actor_role: "admin",
        reason: `completed_by_${admin.login}`
      })
    ]);
  }
  if (body.status === "canceled_admin") {
    await Promise.allSettled([
      supabase.from("service_requests").update({ status: "closed_canceled_admin" }).eq("id", current.request_id),
      supabase.from("order_assignments").update({
        status: "released_by_admin",
        is_current: false,
        ended_at: (/* @__PURE__ */ new Date()).toISOString(),
        end_reason: "canceled_by_admin"
      }).eq("order_id", orderId).eq("is_current", true),
      supabase.from("status_history").insert({
        entity_type: "order",
        entity_id: orderId,
        from_status: current.status,
        to_status: "canceled_admin",
        actor_role: "admin",
        reason: `canceled_by_${admin.login}`
      })
    ]);
  }
  return ok({ order });
});

export { update_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/admin/orders/_orderId/update.post');
//# sourceMappingURL=update.post.mjs.map
