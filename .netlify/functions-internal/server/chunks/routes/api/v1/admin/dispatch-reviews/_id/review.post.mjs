globalThis.__timing__.logStart('Load chunks/routes/api/v1/admin/dispatch-reviews/_id/review.post');import { d as defineEventHandler, b as requireAdminSession, e as getRouterParam, r as readBody, a as apiError, g as getSupabaseAdmin, o as ok, f as computeMissingFields, h as createAndSendDispatch } from '../../../../../../nitro/nitro.mjs';
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
  const admin = requireAdminSession(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  if (!id) apiError(422, "validation.failed", "id is required");
  if (body.action !== "approve" && body.action !== "reject") {
    apiError(422, "validation.failed", "action must be approve or reject");
  }
  const supabase = getSupabaseAdmin(event);
  const { data: review, error: reviewError } = await supabase.from("admin_dispatch_reviews").select("id, request_id, status").eq("id", id).single();
  if (reviewError || !review) {
    apiError(404, "request.not_found", "Dispatch review not found");
  }
  if (review.status !== "pending") {
    apiError(409, "validation.failed", "Dispatch review already reviewed");
  }
  const { data: request, error: requestError } = await supabase.from("service_requests").select("*").eq("id", review.request_id).single();
  if (requestError || !request) {
    apiError(404, "request.not_found", "Request not found");
  }
  if (body.action === "reject") {
    const { error: rejectError } = await supabase.from("admin_dispatch_reviews").update({
      status: "rejected",
      reviewed_by_login: admin.login,
      reviewed_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", review.id);
    if (rejectError) {
      apiError(500, "db.failed", "Failed to reject dispatch review", { reason: rejectError.message });
    }
    return ok({ status: "rejected" });
  }
  if (request.status !== "ready_for_dispatch") {
    apiError(409, "request.not_dispatchable", "Request is not ready for dispatch");
  }
  const missing = computeMissingFields({
    domain_id: request.domain_id,
    issue_tag_id: request.issue_tag_id,
    issue_custom: request.issue_custom,
    problem_summary: request.problem_summary,
    phone_e164: request.phone_e164,
    address_text: request.address_text,
    address_lat: request.address_lat,
    address_lng: request.address_lng,
    landmark_text: request.landmark_text,
    urgency: request.urgency,
    visit_time_mode: request.visit_time_mode,
    visit_time_at: request.visit_time_at,
    consent_share: request.consent_share
  });
  if (missing.length > 0) {
    apiError(409, "request.not_dispatchable", "Request is not dispatchable", { missing_required: missing });
  }
  const dispatch = await createAndSendDispatch(event, request);
  const { error: approveError } = await supabase.from("admin_dispatch_reviews").update({
    status: "approved",
    reviewed_by_login: admin.login,
    reviewed_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", review.id);
  if (approveError) {
    apiError(500, "db.failed", "Failed to approve dispatch review", { reason: approveError.message });
  }
  return ok(dispatch);
});

export { review_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/admin/dispatch-reviews/_id/review.post');
//# sourceMappingURL=review.post.mjs.map
