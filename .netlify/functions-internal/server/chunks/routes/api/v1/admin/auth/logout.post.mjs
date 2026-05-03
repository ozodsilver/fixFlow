globalThis.__timing__.logStart('Load chunks/routes/api/v1/admin/auth/logout.post');import { d as defineEventHandler, c as clearAdminSessionCookie, o as ok } from '../../../../../nitro/nitro.mjs';
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

const logout_post = defineEventHandler(async (event) => {
  clearAdminSessionCookie(event);
  return ok({ ok: true });
});

export { logout_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/admin/auth/logout.post');
//# sourceMappingURL=logout.post.mjs.map
