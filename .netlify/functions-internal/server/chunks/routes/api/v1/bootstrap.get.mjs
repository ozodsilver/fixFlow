globalThis.__timing__.logStart('Load chunks/routes/api/v1/bootstrap.get');import { d as defineEventHandler, k as requireUserContext, o as ok } from '../../../nitro/nitro.mjs';
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

const bootstrap_get = defineEventHandler(async (event) => {
  const ctx = await requireUserContext(event);
  return ok({
    user: ctx.user,
    roles: ctx.roles,
    config: {
      default_locale: "uz_cyrl",
      max_dispatch_attempts: 3
    }
  });
});

export { bootstrap_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/bootstrap.get');
//# sourceMappingURL=bootstrap.get.mjs.map
