globalThis.__timing__.logStart('Load chunks/routes/api/v1/index.get');import { d as defineEventHandler, k as requireUserContext, g as getSupabaseAdmin, a as apiError, o as ok } from '../../../nitro/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  const { user } = await requireUserContext(event);
  const supabase = getSupabaseAdmin(event);
  const { data, error } = await supabase.from("service_requests").select("*").eq("requester_id", user.id).order("created_at", { ascending: false });
  if (error) {
    apiError(500, "db.failed", "Failed to load requests", { reason: error.message });
  }
  return ok({ items: data || [] });
});

export { index_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/index.get');
//# sourceMappingURL=index.get.mjs.map
