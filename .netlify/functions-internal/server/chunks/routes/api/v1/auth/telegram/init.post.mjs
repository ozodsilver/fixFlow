globalThis.__timing__.logStart('Load chunks/routes/api/v1/auth/telegram/init.post');import { d as defineEventHandler, u as useRuntimeConfig, r as readBody, g as getSupabaseAdmin, a as apiError, v as verifyTelegramInitData, j as setSessionCookie, o as ok } from '../../../../../nitro/nitro.mjs';
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

const init_post = defineEventHandler(async (event) => {
  var _a, _b;
  const config = useRuntimeConfig(event);
  const body = await readBody(event);
  const supabase = getSupabaseAdmin(event);
  let telegramUserId = null;
  let displayName = null;
  let username = null;
  let usedDevBypass = false;
  if (body.init_data) {
    if (!config.telegramBotToken) {
      apiError(500, "config.missing", "TELEGRAM_BOT_TOKEN is not configured");
    }
    const parsedUser = verifyTelegramInitData(body.init_data, config.telegramBotToken);
    if (!(parsedUser == null ? void 0 : parsedUser.id)) {
      apiError(401, "auth.invalid_init_data", "Invalid Telegram init data");
    }
    telegramUserId = parsedUser.id;
    displayName = [parsedUser.first_name, parsedUser.last_name].filter(Boolean).join(" ").trim() || `User ${parsedUser.id}`;
    username = (_a = parsedUser.username) != null ? _a : null;
  } else if (config.public.allowDevAuthBypass && body.telegram_user_id) {
    usedDevBypass = true;
    telegramUserId = body.telegram_user_id;
    displayName = ((_b = body.display_name) == null ? void 0 : _b.trim()) || `Dev User ${body.telegram_user_id}`;
    username = null;
  }
  if (!telegramUserId || !displayName) {
    apiError(401, "auth.invalid_init_data", "Auth payload is invalid");
  }
  const locale = body.locale === "ru" ? "ru" : "uz_cyrl";
  const { data: user, error: upsertError } = await supabase.from("users").upsert(
    {
      telegram_user_id: telegramUserId,
      display_name: displayName,
      username,
      locale,
      last_seen_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    { onConflict: "telegram_user_id" }
  ).select("id, telegram_user_id, display_name, username, locale").single();
  if (upsertError || !user) {
    apiError(500, "db.failed", "Failed to create or update user", { reason: upsertError == null ? void 0 : upsertError.message });
  }
  if (config.public.allowDevAuthBypass || usedDevBypass) {
    const { error: masterUpsertError } = await supabase.from("master_profiles").upsert(
      {
        user_id: user.id,
        approval_status: "approved",
        is_active: true,
        approved_by: user.id,
        approved_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      { onConflict: "user_id" }
    );
    if (masterUpsertError) {
      apiError(500, "db.failed", "Failed to auto-approve dev master profile", { reason: masterUpsertError.message });
    }
  }
  const [{ data: masterProfile }, { data: adminProfile }] = await Promise.all([
    supabase.from("master_profiles").select("user_id").eq("user_id", user.id).eq("approval_status", "approved").eq("is_active", true).maybeSingle(),
    supabase.from("admin_profiles").select("user_id").eq("user_id", user.id).eq("is_active", true).maybeSingle()
  ]);
  const exp = setSessionCookie(event, user.id, user.telegram_user_id);
  return ok({
    session_expires_at: new Date(exp * 1e3).toISOString(),
    user,
    roles: {
      is_master: !!masterProfile,
      is_admin: !!adminProfile
    }
  });
});

export { init_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/auth/telegram/init.post');
//# sourceMappingURL=init.post.mjs.map
