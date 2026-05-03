globalThis.__timing__.logStart('Load chunks/routes/api/v1/admin/cancel-requests/_id/review.post');import { d as defineEventHandler, b as requireAdminSession, e as getRouterParam, r as readBody, a as apiError, g as getSupabaseAdmin, o as ok } from '../../../../../../nitro/nitro.mjs';
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

const review_post = defineEventHandler(async (event) => {
  requireAdminSession(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  if (!id) apiError(422, "validation.failed", "id is required");
  if (!body.action) apiError(422, "validation.failed", "action is required");
  const supabase = getSupabaseAdmin(event);
  const { data: row, error: rowError } = await supabase.from("admin_cancel_requests").select("id, request_id, status").eq("id", id).single();
  if (rowError || !row) {
    apiError(404, "request.not_found", "Cancel request not found");
  }
  if (row.status !== "pending") {
    apiError(409, "validation.failed", "Cancel request already reviewed");
  }
  if (body.action === "approve") {
    const { error: cancelError } = await supabase.from("service_requests").update({ status: "closed_canceled_admin", closed_reason: "admin_approved_requester_cancel" }).eq("id", row.request_id);
    if (cancelError) {
      apiError(500, "db.failed", "Failed to cancel request", { reason: cancelError.message });
    }
  }
  const { error: reviewError } = await supabase.from("admin_cancel_requests").update({
    status: body.action === "approve" ? "approved" : "rejected",
    reviewed_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", id);
  if (reviewError) {
    apiError(500, "db.failed", "Failed to review cancel request", { reason: reviewError.message });
  }
  return ok({ status: body.action === "approve" ? "approved" : "rejected" });
});

export { review_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/admin/cancel-requests/_id/review.post');
//# sourceMappingURL=review.post.mjs.map
