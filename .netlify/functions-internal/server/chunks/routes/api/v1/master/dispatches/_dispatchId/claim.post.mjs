globalThis.__timing__.logStart('Load chunks/routes/api/v1/master/dispatches/_dispatchId/claim.post');import { d as defineEventHandler, e as getRouterParam, a as apiError, r as readBody, u as useRuntimeConfig, n as requireMasterContext, p as hashRequestPayload, m as sendTelegramUserMessage, q as buildMasterClaimNotificationText, o as ok } from '../../../../../../nitro/nitro.mjs';
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

const claim_post = defineEventHandler(async (event) => {
  var _a, _b;
  const dispatchId = getRouterParam(event, "dispatchId");
  if (!dispatchId) {
    apiError(422, "validation.failed", "dispatchId is required");
  }
  const body = await readBody(event);
  if (!body.idempotency_key) {
    apiError(422, "validation.failed", "idempotency_key is required");
  }
  const config = useRuntimeConfig(event);
  const { ctx, supabase } = await requireMasterContext(event);
  const requestHash = hashRequestPayload({ dispatch_id: dispatchId, master_user_id: ctx.user.id });
  const { data, error } = await supabase.rpc("rpc_claim_dispatch", {
    p_dispatch_id: dispatchId,
    p_master_user_id: ctx.user.id,
    p_idempotency_key: body.idempotency_key,
    p_request_hash: requestHash,
    p_ip: null,
    p_user_agent: event.node.req.headers["user-agent"] || null
  });
  if (error || !data) {
    apiError(500, "db.failed", "Claim RPC failed", { reason: error == null ? void 0 : error.message });
  }
  if (!data.ok) {
    const errCode = ((_a = data.error) == null ? void 0 : _a.code) || "dispatch.claim_conflict";
    const errMessage = ((_b = data.error) == null ? void 0 : _b.message) || "Dispatch claim failed";
    apiError(409, errCode, errMessage);
  }
  const { data: order } = await supabase.from("orders").select(`
      id,
      service_requests!orders_request_id_fkey(
        public_code, problem_summary, phone_e164, address_text, landmark_text, visit_time_mode, visit_time_at, locale,
        users!service_requests_requester_id_fkey(display_name)
      )
    `).eq("id", data.data.order_id).maybeSingle();
  const request = Array.isArray(order == null ? void 0 : order.service_requests) ? order == null ? void 0 : order.service_requests[0] : order == null ? void 0 : order.service_requests;
  if (config.telegramBotToken && request) {
    const miniAppUrl = config.miniAppBaseUrl ? `${String(config.miniAppBaseUrl).replace(/\/+$/, "")}/master/orders/${data.data.order_id}` : "";
    const requester = Array.isArray(request.users) ? request.users[0] : request.users;
    const sent = await sendTelegramUserMessage(
      config.telegramBotToken,
      ctx.user.telegram_user_id,
      buildMasterClaimNotificationText({
        public_code: request.public_code,
        requester_name: requester == null ? void 0 : requester.display_name,
        phone_e164: request.phone_e164,
        address_text: request.address_text,
        landmark_text: request.landmark_text,
        problem_summary: request.problem_summary,
        visit_time_mode: request.visit_time_mode,
        visit_time_at: request.visit_time_at,
        locale: request.locale
      }),
      miniAppUrl ? { text: request.locale === "ru" ? "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0437\u0430\u043A\u0430\u0437" : "\u0411\u0443\u044E\u0440\u0442\u043C\u0430\u043D\u0438 \u043E\u0447\u0438\u0448", url: miniAppUrl } : void 0
    );
    if (!sent.ok) {
      console.warn("telegram.master_claim_notify_failed", sent.error);
    }
  }
  return ok({ ...data.data });
});

export { claim_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/master/dispatches/_dispatchId/claim.post');
//# sourceMappingURL=claim.post.mjs.map
