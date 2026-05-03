globalThis.__timing__.logStart('Load chunks/routes/api/v1/requests/_requestId/intake/structured.post');import { d as defineEventHandler, e as getRouterParam, a as apiError, r as readBody, t as requireOwnedRequest, g as getSupabaseAdmin, w as createPendingDispatchReview, u as useRuntimeConfig, o as ok, m as sendTelegramUserMessage, x as buildAdminReviewNotificationText } from '../../../../../../nitro/nitro.mjs';
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

function normalizePhone(raw) {
  const clean = raw.replace(/[^\d+]/g, "");
  if (!clean) return null;
  if (clean.startsWith("+") && /^\+[1-9][0-9]{7,14}$/.test(clean)) return clean;
  if (/^998\d{9}$/.test(clean)) return `+${clean}`;
  if (/^\d{9}$/.test(clean)) return `+998${clean}`;
  return null;
}
const structured_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  const requestId = getRouterParam(event, "requestId");
  if (!requestId) {
    apiError(422, "validation.failed", "requestId is required");
  }
  const body = await readBody(event);
  const visitTimeAtRaw = (_a = body.visit_time_at) == null ? void 0 : _a.trim();
  const phone = (_b = body.phone) == null ? void 0 : _b.trim();
  const addressText = (_c = body.address_text) == null ? void 0 : _c.trim();
  const lat = body.address_lat;
  const lng = body.address_lng;
  if (!visitTimeAtRaw) {
    apiError(422, "validation.failed", "visit_time_at is required");
  }
  if (!phone) {
    apiError(422, "validation.failed", "phone is required");
  }
  if (!addressText || typeof lat !== "number" || typeof lng !== "number") {
    apiError(422, "validation.failed", "address_text, address_lat, address_lng are required");
  }
  const phoneE164 = normalizePhone(phone);
  if (!phoneE164) {
    apiError(422, "validation.failed", "phone is invalid");
  }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    apiError(422, "validation.failed", "Invalid map coordinates");
  }
  const visitDate = new Date(visitTimeAtRaw);
  if (Number.isNaN(visitDate.getTime())) {
    apiError(422, "validation.failed", "visit_time_at is invalid");
  }
  const { ctx, request } = await requireOwnedRequest(event, requestId);
  const summary = ((_d = body.problem_summary) == null ? void 0 : _d.trim()) || ((_e = request.problem_summary) == null ? void 0 : _e.trim()) || "";
  if (summary.length < 8) {
    apiError(422, "validation.failed", "problem_summary is required");
  }
  const supabase = getSupabaseAdmin(event);
  if (request.current_dispatch_attempt >= 3) {
    apiError(409, "dispatch.max_attempts_exhausted", "Max dispatch attempts exhausted");
  }
  const { data: updatedRequest, error: updateError } = await supabase.from("service_requests").update({
    phone_e164: phoneE164,
    problem_summary: summary.slice(0, 240),
    address_text: addressText.slice(0, 280),
    address_lat: lat,
    address_lng: lng,
    visit_time_mode: "scheduled",
    visit_time_at: visitDate.toISOString(),
    status: "ready_for_dispatch"
  }).eq("id", request.id).select("*").single();
  if (updateError || !updatedRequest) {
    apiError(500, "db.failed", "Failed to update request", { reason: updateError == null ? void 0 : updateError.message });
  }
  const reviewId = await createPendingDispatchReview(event, updatedRequest);
  const aiReply = request.locale === "ru" ? "\u0421\u043F\u0430\u0441\u0438\u0431\u043E. \u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0443 \u043D\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443." : "\u0420\u0430\u04B3\u043C\u0430\u0442. \u041C\u0443\u0440\u043E\u0436\u0430\u0430\u0442 \u0430\u0434\u043C\u0438\u043D \u0442\u0435\u043A\u0448\u0438\u0440\u0443\u0432\u0438\u0433\u0430 \u044E\u0431\u043E\u0440\u0438\u043B\u0434\u0438.";
  const config = useRuntimeConfig(event);
  const notifyAdmin = async () => {
    const adminChatId = Number(config.telegramAdminChatId);
    if (!config.telegramBotToken || !Number.isFinite(adminChatId) || adminChatId === 0) return;
    const sent = await sendTelegramUserMessage(
      config.telegramBotToken,
      adminChatId,
      buildAdminReviewNotificationText({
        public_code: updatedRequest.public_code,
        requester_name: ctx.user.display_name,
        phone_e164: updatedRequest.phone_e164,
        problem_summary: updatedRequest.problem_summary,
        locale: updatedRequest.locale
      })
    );
    if (!sent.ok) {
      console.warn("telegram.admin_review_notify_failed", sent.error);
    }
  };
  await Promise.allSettled([
    supabase.from("request_intake_messages").insert([
      {
        request_id: request.id,
        sender: "user",
        message_text: summary,
        field_patch: {
          phone_e164: phoneE164,
          address_text: addressText,
          address_lat: lat,
          address_lng: lng,
          problem_summary: summary
        }
      },
      {
        request_id: request.id,
        sender: "ai",
        message_text: aiReply,
        field_patch: {},
        validation_snapshot: {
          intent: "ready",
          missing_required: [],
          ready_for_dispatch: true
        }
      }
    ]),
    notifyAdmin()
  ]);
  return ok({
    ai_reply: aiReply,
    request: updatedRequest,
    review_id: reviewId,
    dispatch_id: null,
    expires_at: null,
    admin_review_required: true
  });
});

export { structured_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/requests/_requestId/intake/structured.post');
//# sourceMappingURL=structured.post.mjs.map
