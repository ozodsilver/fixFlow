globalThis.__timing__.logStart('Load chunks/routes/api/v1/service-domains.get');import { d as defineEventHandler, k as requireUserContext, g as getSupabaseAdmin, a as apiError, o as ok } from '../../../nitro/nitro.mjs';
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

const serviceDomains_get = defineEventHandler(async (event) => {
  await requireUserContext(event);
  const supabase = getSupabaseAdmin(event);
  const { data, error } = await supabase.from("service_domains").select("id, slug, name_uz_cyrl, name_ru, is_active, sort_order").eq("is_active", true).order("sort_order", { ascending: true });
  if (error) {
    apiError(500, "db.failed", "Failed to load service domains", { reason: error.message });
  }
  return ok(data || []);
});

export { serviceDomains_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/service-domains.get');
//# sourceMappingURL=service-domains.get.mjs.map
