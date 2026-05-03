globalThis.__timing__.logStart('Load chunks/routes/api/v1/index.post');import { randomBytes } from 'node:crypto';
import { d as defineEventHandler, r as readBody, k as requireUserContext, g as getSupabaseAdmin, a as apiError, o as ok } from '../../../nitro/nitro.mjs';
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

function createPublicCode() {
  return `SR-${randomBytes(3).toString("hex").toUpperCase()}`;
}
const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { user } = await requireUserContext(event);
  const supabase = getSupabaseAdmin(event);
  if (!body.domain_id) {
    apiError(422, "validation.failed", "domain_id is required");
  }
  const { data: domain } = await supabase.from("service_domains").select("id").eq("id", body.domain_id).eq("is_active", true).maybeSingle();
  if (!domain) {
    apiError(422, "validation.failed", "Invalid service domain");
  }
  let inserted = null;
  let attempts = 0;
  while (!inserted && attempts < 5) {
    attempts += 1;
    const publicCode = createPublicCode();
    const { data, error } = await supabase.from("service_requests").insert({
      public_code: publicCode,
      requester_id: user.id,
      domain_id: body.domain_id,
      locale: body.locale === "ru" ? "ru" : "uz_cyrl",
      status: "draft"
    }).select("id, public_code, status").single();
    if (!error && data) {
      inserted = data;
      break;
    }
    if (error && !error.message.toLowerCase().includes("public_code")) {
      apiError(500, "db.failed", "Failed to create request", { reason: error.message });
    }
  }
  if (!inserted) {
    apiError(500, "db.failed", "Failed to generate unique request code");
  }
  return ok({
    request_id: inserted.id,
    public_code: inserted.public_code,
    status: inserted.status
  });
});

export { index_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/index.post');
//# sourceMappingURL=index.post.mjs.map
