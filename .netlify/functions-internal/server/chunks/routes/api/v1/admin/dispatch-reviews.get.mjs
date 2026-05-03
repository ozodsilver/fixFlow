globalThis.__timing__.logStart('Load chunks/routes/api/v1/admin/dispatch-reviews.get');import { d as defineEventHandler, b as requireAdminSession, g as getSupabaseAdmin, a as apiError, o as ok } from '../../../../nitro/nitro.mjs';
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

const dispatchReviews_get = defineEventHandler(async (event) => {
  requireAdminSession(event);
  const supabase = getSupabaseAdmin(event);
  const select = `
    id, status, created_at, reviewed_at, request_id, requester_id,
    service_requests(id, public_code, status, problem_summary, phone_e164, address_text, urgency, visit_time_mode, visit_time_at),
    users!admin_dispatch_reviews_requester_id_fkey(id, display_name, phone_e164, telegram_user_id)
  `;
  const { data: pending, error: pendingError } = await supabase.from("admin_dispatch_reviews").select(select).eq("status", "pending").order("created_at", { ascending: false });
  if (pendingError) {
    apiError(500, "db.failed", "Failed to load pending dispatch reviews", { reason: pendingError.message });
  }
  const { data: history, error: historyError } = await supabase.from("admin_dispatch_reviews").select(select).neq("status", "pending").order("reviewed_at", { ascending: false }).limit(30);
  if (historyError) {
    apiError(500, "db.failed", "Failed to load dispatch review history", { reason: historyError.message });
  }
  return ok({ pending: pending || [], history: history || [] });
});

export { dispatchReviews_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/admin/dispatch-reviews.get');
//# sourceMappingURL=dispatch-reviews.get.mjs.map
