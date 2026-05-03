globalThis.__timing__.logStart('Load chunks/routes/api/v1/admin/auth/me.get');import { d as defineEventHandler, b as requireAdminSession, o as ok } from '../../../../../nitro/nitro.mjs';
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

const me_get = defineEventHandler(async (event) => {
  const session = requireAdminSession(event);
  return ok({ login: session.login });
});

export { me_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/admin/auth/me.get');
//# sourceMappingURL=me.get.mjs.map
