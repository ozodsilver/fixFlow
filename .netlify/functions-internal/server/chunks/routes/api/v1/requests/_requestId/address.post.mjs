globalThis.__timing__.logStart('Load chunks/routes/api/v1/requests/_requestId/address.post');import { d as defineEventHandler, e as getRouterParam, a as apiError, r as readBody, t as requireOwnedRequest, g as getSupabaseAdmin, o as ok } from '../../../../../nitro/nitro.mjs';
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

const allowedStatuses = ["draft", "intake_in_progress", "ready_for_dispatch"];
const address_post = defineEventHandler(async (event) => {
  var _a;
  const requestId = getRouterParam(event, "requestId");
  if (!requestId) {
    apiError(422, "validation.failed", "requestId is required");
  }
  const body = await readBody(event);
  const addressText = (_a = body.address_text) == null ? void 0 : _a.trim();
  const lat = body.address_lat;
  const lng = body.address_lng;
  if (!addressText || typeof lat !== "number" || typeof lng !== "number") {
    apiError(422, "validation.failed", "address_text, address_lat, address_lng are required");
  }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    apiError(422, "validation.failed", "Invalid map coordinates");
  }
  const { request } = await requireOwnedRequest(event, requestId);
  if (!allowedStatuses.includes(request.status)) {
    apiError(409, "request.not_dispatchable", "Address update is not allowed in current request state");
  }
  const supabase = getSupabaseAdmin(event);
  const { data: updatedRequest, error } = await supabase.from("service_requests").update({
    address_text: addressText,
    address_lat: lat,
    address_lng: lng
  }).eq("id", request.id).select("*").single();
  if (error || !updatedRequest) {
    apiError(500, "db.failed", "Failed to save address", { reason: error == null ? void 0 : error.message });
  }
  await supabase.from("request_intake_messages").insert({
    request_id: request.id,
    sender: "system",
    message_text: request.locale === "ru" ? "\u0410\u0434\u0440\u0435\u0441 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D \u043F\u043E \u043A\u0430\u0440\u0442\u0435." : "\u041C\u0430\u043D\u0437\u0438\u043B \u0445\u0430\u0440\u0438\u0442\u0430 \u043E\u0440\u049B\u0430\u043B\u0438 \u0441\u0430\u049B\u043B\u0430\u043D\u0434\u0438.",
    field_patch: {
      address_text: addressText,
      address_lat: lat,
      address_lng: lng
    }
  });
  return ok({
    request: updatedRequest
  });
});

export { address_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/requests/_requestId/address.post');
//# sourceMappingURL=address.post.mjs.map
