globalThis.__timing__.logStart('Load chunks/routes/api/v1/admin/orders.get');import { d as defineEventHandler, b as requireAdminSession, g as getSupabaseAdmin, i as getQuery, a as apiError, o as ok } from '../../../../nitro/nitro.mjs';
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

const orders_get = defineEventHandler(async (event) => {
  requireAdminSession(event);
  const supabase = getSupabaseAdmin(event);
  const query = getQuery(event);
  const status = typeof query.status === "string" ? query.status : "";
  let request = supabase.from("orders").select(`
      id, request_id, status, final_price_amount, commission_percent, commission_amount, commission_status,
      commission_paid_at, admin_note, completed_at, completed_by_admin_at, canceled_at, created_at, updated_at,
      service_requests!orders_request_id_fkey(
        id, public_code, status, problem_summary, phone_e164, address_text, visit_time_mode, visit_time_at,
        users!service_requests_requester_id_fkey(id, display_name, phone_e164, telegram_user_id)
      ),
      order_assignments(
        id, master_id, status, is_current, assigned_at, ended_at,
        users!order_assignments_master_id_fkey(id, display_name, phone_e164, telegram_user_id)
      )
    `).order("created_at", { ascending: false }).limit(80);
  if (status) {
    request = request.eq("status", status);
  }
  const { data, error } = await request;
  if (error) {
    apiError(500, "db.failed", "Failed to load orders", { reason: error.message });
  }
  return ok({ items: data || [] });
});

export { orders_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/admin/orders.get');
//# sourceMappingURL=orders.get.mjs.map
