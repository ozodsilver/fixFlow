globalThis.__timing__.logStart('Load chunks/routes/api/v1/admin/auth/login.post');import { d as defineEventHandler, r as readBody, u as useRuntimeConfig, a as apiError, s as setAdminSessionCookie, o as ok } from '../../../../../nitro/nitro.mjs';
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

const login_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const config = useRuntimeConfig(event);
  const login = ((_a = body.login) == null ? void 0 : _a.trim()) || "";
  const password = body.password || "";
  if (!login || !password) {
    apiError(422, "validation.failed", "login and password are required");
  }
  if (login !== (config.adminLogin || "").trim() || password !== (config.adminPassword || "")) {
    apiError(403, "access.forbidden", "Invalid admin credentials");
  }
  setAdminSessionCookie(event, login);
  return ok({ ok: true });
});

export { login_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/admin/auth/login.post');
//# sourceMappingURL=login.post.mjs.map
