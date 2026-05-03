globalThis.__timing__.logStart('Load chunks/routes/api/v1/admin/masters/_userId/status.post');import { d as defineEventHandler, b as requireAdminSession, e as getRouterParam, a as apiError, r as readBody, g as getSupabaseAdmin, o as ok } from '../../../../../../nitro/nitro.mjs';
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

const allowedStatuses = /* @__PURE__ */ new Set(["pending", "approved", "revoked"]);
const status_post = defineEventHandler(async (event) => {
  var _a;
  const admin = requireAdminSession(event);
  const userId = getRouterParam(event, "userId");
  if (!userId) apiError(422, "validation.failed", "userId is required");
  const body = await readBody(event);
  if (!body.status || !allowedStatuses.has(body.status)) {
    apiError(422, "validation.failed", "status must be pending, approved, or revoked");
  }
  const supabase = getSupabaseAdmin(event);
  const { data: targetUser, error: userError } = await supabase.from("users").select("id").eq("id", userId).single();
  if (userError || !targetUser) {
    apiError(404, "request.not_found", "User not found");
  }
  const { data: adminProfile } = await supabase.from("admin_profiles").select("user_id").eq("is_active", true).order("granted_at", { ascending: true }).limit(1).maybeSingle();
  const actorUserId = (adminProfile == null ? void 0 : adminProfile.user_id) || userId;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const patch = {
    user_id: userId,
    approval_status: body.status,
    is_active: body.status === "approved" ? (_a = body.is_active) != null ? _a : true : false
  };
  if (body.status === "approved") {
    patch.approved_by = actorUserId;
    patch.approved_at = now;
    patch.revoked_by = null;
    patch.revoked_at = null;
  } else if (body.status === "revoked") {
    patch.revoked_by = actorUserId;
    patch.revoked_at = now;
  } else {
    patch.approved_by = null;
    patch.approved_at = null;
    patch.revoked_by = null;
    patch.revoked_at = null;
  }
  const { data: profile, error } = await supabase.from("master_profiles").upsert(patch, { onConflict: "user_id" }).select("*").single();
  if (error || !profile) {
    apiError(500, "db.failed", "Failed to update master status", { reason: error == null ? void 0 : error.message });
  }
  await supabase.from("audit_logs").insert({
    actor_user_id: (adminProfile == null ? void 0 : adminProfile.user_id) || null,
    action: `master.${body.status}`,
    entity_type: "master_profile",
    entity_id: userId,
    meta: { admin_login: admin.login, target_user_id: userId }
  }).then(() => void 0);
  return ok({ profile });
});

export { status_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/admin/masters/_userId/status.post');
//# sourceMappingURL=status.post.mjs.map
