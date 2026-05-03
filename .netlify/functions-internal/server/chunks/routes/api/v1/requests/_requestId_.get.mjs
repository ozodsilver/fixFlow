globalThis.__timing__.logStart('Load chunks/routes/api/v1/requests/_requestId_.get');import { d as defineEventHandler, e as getRouterParam, a as apiError, t as requireOwnedRequest, o as ok } from '../../../../nitro/nitro.mjs';
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

const _requestId__get = defineEventHandler(async (event) => {
  const requestId = getRouterParam(event, "requestId");
  if (!requestId) {
    apiError(422, "validation.failed", "requestId is required");
  }
  const { request } = await requireOwnedRequest(event, requestId);
  return ok(request);
});

export { _requestId__get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/requests/_requestId_.get');
//# sourceMappingURL=_requestId_.get.mjs.map
