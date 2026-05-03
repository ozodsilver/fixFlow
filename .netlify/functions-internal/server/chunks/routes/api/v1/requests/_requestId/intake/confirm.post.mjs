globalThis.__timing__.logStart('Load chunks/routes/api/v1/requests/_requestId/intake/confirm.post');import { d as defineEventHandler, e as getRouterParam, r as readBody, a as apiError, t as requireOwnedRequest, g as getSupabaseAdmin, f as computeMissingFields, o as ok } from '../../../../../../nitro/nitro.mjs';
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

const confirm_post = defineEventHandler(async (event) => {
  const requestId = getRouterParam(event, "requestId");
  const body = await readBody(event);
  if (!requestId) {
    apiError(422, "validation.failed", "requestId is required");
  }
  if (!body.confirm) {
    apiError(422, "validation.failed", "confirm=true is required");
  }
  const { request } = await requireOwnedRequest(event, requestId);
  const supabase = getSupabaseAdmin(event);
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
    apiError(409, "request.not_dispatchable", "Request is not ready for dispatch", { missing_required: missing });
  }
  const { data, error } = await supabase.from("service_requests").update({ status: "ready_for_dispatch" }).eq("id", request.id).select("status").single();
  if (error || !data) {
    apiError(500, "db.failed", "Failed to confirm intake", { reason: error == null ? void 0 : error.message });
  }
  return ok({
    status: data.status,
    missing_required: []
  });
});

export { confirm_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/requests/_requestId/intake/confirm.post');
//# sourceMappingURL=confirm.post.mjs.map
