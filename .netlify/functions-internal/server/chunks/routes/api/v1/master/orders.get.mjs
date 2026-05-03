globalThis.__timing__.logStart('Load chunks/routes/api/v1/master/orders.get');import { d as defineEventHandler, n as requireMasterContext, a as apiError, o as ok } from '../../../../nitro/nitro.mjs';
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
  const { ctx, supabase } = await requireMasterContext(event);
  const { data, error } = await supabase.from("order_assignments").select(`
      id, status, is_current, assigned_at, ended_at,
      orders!order_assignments_order_id_fkey(
        id, status, final_price_amount, commission_percent, commission_amount, commission_status,
        completed_at, canceled_at, created_at,
        service_requests!orders_request_id_fkey(
          id, public_code, problem_summary, phone_e164, address_text, landmark_text,
          urgency, visit_time_mode, visit_time_at, locale
        )
      )
    `).eq("master_id", ctx.user.id).order("assigned_at", { ascending: false }).limit(80);
  if (error) {
    apiError(500, "db.failed", "Failed to load master orders", { reason: error.message });
  }
  return ok({ items: data || [] });
});

export { orders_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/master/orders.get');
//# sourceMappingURL=orders.get.mjs.map
