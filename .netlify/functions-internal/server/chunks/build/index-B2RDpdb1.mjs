globalThis.__timing__.logStart('Load chunks/build/index-B2RDpdb1');import { j as useRoute, b as _sfc_main$8, n as navigateTo } from './server.mjs';
import { defineComponent, computed, ref, unref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import '../nitro/nitro.mjs';
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
import 'vue-router';
import 'tailwindcss/colors';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const debugEnabled = computed(() => String(route.query.ffdebug || "") === "1");
    const debugLines = ref([]);
    const debugFinal = ref("");
    const pickDispatchIdFromStartParam = (startParamRaw) => {
      if (!startParamRaw.startsWith("dispatch_")) return "";
      return startParamRaw.slice("dispatch_".length);
    };
    const pickDispatchIdFromQuery = () => {
      const directDispatchId = route.query.dispatch_id ? String(route.query.dispatch_id) : "";
      debugLines.value.push(`query.dispatch_id = ${directDispatchId || "-"}`);
      if (directDispatchId) return directDispatchId;
      const startParamRaw = route.query.startapp ? String(route.query.startapp) : route.query.tgWebAppStartParam ? String(route.query.tgWebAppStartParam) : "";
      debugLines.value.push(`query.startapp/tgWebAppStartParam = ${startParamRaw || "-"}`);
      const fromQuery = pickDispatchIdFromStartParam(startParamRaw);
      debugLines.value.push(`dispatch from query = ${fromQuery || "-"}`);
      if (fromQuery) return fromQuery;
      return "";
    };
    const resolveAndNavigate = async () => {
      debugLines.value = [];
      let dispatchId = pickDispatchIdFromQuery();
      const hasDispatchHintInUrl = false;
      debugLines.value.push(`hasDispatchHintInUrl = ${hasDispatchHintInUrl}`);
      debugLines.value.push(`final dispatchId = ${dispatchId || "-"}`);
      if (dispatchId) {
        debugFinal.value = `/master/dispatches/${dispatchId}`;
        if (debugEnabled.value) return;
        await navigateTo(`/master/dispatches/${dispatchId}`, { replace: true });
        return;
      }
      debugFinal.value = "/requester";
      if (debugEnabled.value || hasDispatchHintInUrl) return;
      await navigateTo("/requester", { replace: true });
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$8;
      if (unref(debugEnabled) || unref(debugLines).some((line) => line.includes("hasDispatchHintInUrl = true"))) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-dvh bg-slate-50 p-4 text-slate-800" }, _attrs))}><div class="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p class="text-sm font-bold">Start Param Debug</p><p class="mt-1 text-xs text-slate-500">Quyidagi qiymatlar Telegram ichida real kelgan ma&#39;lumotlar.</p><pre class="mt-3 max-h-[55vh] overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-emerald-300">${ssrInterpolate(unref(debugLines).join("\n"))}</pre><p class="mt-3 text-sm font-semibold">Route: ${ssrInterpolate(unref(debugFinal) || "-")}</p><div class="mt-3 flex gap-2">`);
        _push(ssrRenderComponent(_component_UButton, {
          color: "primary",
          onClick: resolveAndNavigate
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Qayta tekshirish`);
            } else {
              return [
                createTextVNode("Qayta tekshirish")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UButton, {
          color: "neutral",
          variant: "soft",
          onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(unref(debugFinal) || "/requester", { replace: true })
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Davom etish`);
            } else {
              return [
                createTextVNode("Davom etish")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };;globalThis.__timing__.logEnd('Load chunks/build/index-B2RDpdb1');
//# sourceMappingURL=index-B2RDpdb1.mjs.map
