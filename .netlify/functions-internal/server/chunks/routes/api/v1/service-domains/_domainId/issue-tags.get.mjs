globalThis.__timing__.logStart('Load chunks/routes/api/v1/service-domains/_domainId/issue-tags.get');import { d as defineEventHandler, k as requireUserContext, g as getSupabaseAdmin, e as getRouterParam, a as apiError, o as ok } from '../../../../../nitro/nitro.mjs';
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

const issueTags_get = defineEventHandler(async (event) => {
  await requireUserContext(event);
  const supabase = getSupabaseAdmin(event);
  const domainId = Number(getRouterParam(event, "domainId"));
  if (!domainId) {
    apiError(422, "validation.failed", "domainId is invalid");
  }
  const { data, error } = await supabase.from("issue_tags").select("id, domain_id, slug, name_uz_cyrl, name_ru, is_active, sort_order").eq("domain_id", domainId).eq("is_active", true).order("sort_order", { ascending: true });
  if (error) {
    apiError(500, "db.failed", "Failed to load issue tags", { reason: error.message });
  }
  return ok(data || []);
});

export { issueTags_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/service-domains/_domainId/issue-tags.get');
//# sourceMappingURL=issue-tags.get.mjs.map
