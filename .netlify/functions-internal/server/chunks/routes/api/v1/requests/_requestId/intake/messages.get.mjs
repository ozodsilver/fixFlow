globalThis.__timing__.logStart('Load chunks/routes/api/v1/requests/_requestId/intake/messages.get');import { d as defineEventHandler, e as getRouterParam, a as apiError, t as requireOwnedRequest, g as getSupabaseAdmin, i as getQuery, o as ok } from '../../../../../../nitro/nitro.mjs';
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

function parseLimit(raw) {
  if (typeof raw !== "string" || !raw.trim()) return 80;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) return 80;
  return Math.min(Math.max(value, 1), 200);
}
const messages_get = defineEventHandler(async (event) => {
  const requestId = getRouterParam(event, "requestId");
  if (!requestId) {
    apiError(422, "validation.failed", "requestId is required");
  }
  await requireOwnedRequest(event, requestId);
  const supabase = getSupabaseAdmin(event);
  const query = getQuery(event);
  const limit = parseLimit(query.limit);
  const { data, error } = await supabase.from("request_intake_messages").select("id, sender, message_text, validation_snapshot, offtopic, abuse, created_at").eq("request_id", requestId).order("id", { ascending: true }).limit(limit);
  if (error) {
    apiError(500, "db.failed", "Failed to load intake messages", { reason: error.message });
  }
  return ok({
    items: data || []
  });
});

export { messages_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/requests/_requestId/intake/messages.get');
//# sourceMappingURL=messages.get.mjs.map
