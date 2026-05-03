globalThis.__timing__.logStart('Load chunks/routes/api/v1/admin/masters.get');import { d as defineEventHandler, b as requireAdminSession, g as getSupabaseAdmin, i as getQuery, a as apiError, o as ok } from '../../../../nitro/nitro.mjs';
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

const masters_get = defineEventHandler(async (event) => {
  requireAdminSession(event);
  const supabase = getSupabaseAdmin(event);
  const query = getQuery(event);
  const search = typeof query.search === "string" ? query.search.trim() : "";
  let request = supabase.from("users").select(`
      id, telegram_user_id, display_name, username, phone_e164, locale, is_blocked, last_seen_at, created_at,
      master_profiles!master_profiles_user_id_fkey(
        approval_status, is_active, approved_at, revoked_at, created_at, updated_at
      )
    `).order("last_seen_at", { ascending: false, nullsFirst: false }).limit(120);
  if (search) {
    request = request.or(`display_name.ilike.%${search}%,username.ilike.%${search}%,phone_e164.ilike.%${search}%`);
  }
  const { data, error } = await request;
  if (error) {
    apiError(500, "db.failed", "Failed to load masters", { reason: error.message });
  }
  return ok({ items: data || [] });
});

export { masters_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/admin/masters.get');
//# sourceMappingURL=masters.get.mjs.map
