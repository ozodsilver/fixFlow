globalThis.__timing__.logStart('Load chunks/routes/api/v1/requests/_requestId/dispatch.post');import { d as defineEventHandler, e as getRouterParam, r as readBody, a as apiError, t as requireOwnedRequest, g as getSupabaseAdmin, f as computeMissingFields, w as createPendingDispatchReview, u as useRuntimeConfig, m as sendTelegramUserMessage, x as buildAdminReviewNotificationText, o as ok } from '../../../../../nitro/nitro.mjs';
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

const dispatch_post = defineEventHandler(async (event) => {
  const requestId = getRouterParam(event, "requestId");
  const body = await readBody(event);
  if (!requestId) {
    apiError(422, "validation.failed", "requestId is required");
  }
  if (!body.idempotency_key) {
    apiError(422, "validation.failed", "idempotency_key is required");
  }
  const { ctx, request } = await requireOwnedRequest(event, requestId);
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
    apiError(409, "request.not_dispatchable", "Request is not dispatchable", { missing_required: missing });
  }
  if (request.current_dispatch_attempt >= 3) {
    apiError(409, "dispatch.max_attempts_exhausted", "Max dispatch attempts exhausted");
  }
  const { error: requestUpdateError } = await supabase.from("service_requests").update({
    status: "ready_for_dispatch"
  }).eq("id", request.id);
  if (requestUpdateError) {
    apiError(500, "db.failed", "Failed to update request status", { reason: requestUpdateError.message });
  }
  const reviewId = await createPendingDispatchReview(event, request);
  const config = useRuntimeConfig(event);
  const adminChatId = Number(config.telegramAdminChatId);
  if (config.telegramBotToken && Number.isFinite(adminChatId) && adminChatId !== 0) {
    const sent = await sendTelegramUserMessage(
      config.telegramBotToken,
      adminChatId,
      buildAdminReviewNotificationText({
        public_code: request.public_code,
        requester_name: ctx.user.display_name,
        phone_e164: request.phone_e164,
        problem_summary: request.problem_summary,
        locale: request.locale
      })
    );
    if (!sent.ok) {
      console.warn("telegram.admin_review_notify_failed", sent.error);
    }
  }
  return ok({
    request_id: request.id,
    review_id: reviewId,
    dispatch_id: null,
    status: "ready_for_dispatch",
    expires_at: null,
    admin_review_required: true
  });
});

export { dispatch_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/requests/_requestId/dispatch.post');
//# sourceMappingURL=dispatch.post.mjs.map
