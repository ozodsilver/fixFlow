globalThis.__timing__.logStart('Load chunks/build/index-4tBDiwXj');import { u as useAppI18n, _ as __nuxt_component_0, a as __nuxt_component_2, b as __nuxt_component_3 } from './ErrorState-iIpWDbpG.mjs';
import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { u as useRequesterApi } from './useRequesterApi-Cs76guEi.mjs';
import { k as useRuntimeConfig } from './server.mjs';
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
    const { t, locale } = useAppI18n();
    const api = useRequesterApi();
    const loading = ref(true);
    const errorMessage = ref("");
    const assignments = ref([]);
    const getErrorMessage = (error) => error?.data?.error?.message || error?.data?.message || error?.message || t("common.unexpectedError");
    const tryTelegramAuth = async () => {
      const runtimeConfig = useRuntimeConfig();
      if (runtimeConfig.public.allowDevAuthBypass) {
        const devTelegramUserId = Number(sessionStorage.getItem("ff_dev_tg_uid") || "900001");
        sessionStorage.setItem("ff_dev_tg_uid", String(devTelegramUserId));
        await api.initAuth({ telegram_user_id: devTelegramUserId, display_name: "Dev Local Master", locale: locale.value });
      }
    };
    const loadOrders = async () => {
      loading.value = true;
      errorMessage.value = "";
      try {
        const res = await $fetch("/api/v1/master/orders");
        assignments.value = res.data.items || [];
      } catch (error) {
        const code = error?.data?.error?.code;
        const statusCode = error?.statusCode;
        if (code === "auth.session_expired" || statusCode === 401) {
          try {
            await tryTelegramAuth();
            const res = await $fetch("/api/v1/master/orders");
            assignments.value = res.data.items || [];
            return;
          } catch (retryError) {
            errorMessage.value = getErrorMessage(retryError) || "Session ochilmadi. Mini App ichidan qayta ochib kiring.";
            return;
          }
        }
        errorMessage.value = getErrorMessage(error);
      } finally {
        loading.value = false;
      }
    };
    const orderOf = (assignment) => Array.isArray(assignment.orders) ? assignment.orders[0] : assignment.orders;
    const requestOf = (assignment) => {
      const order = orderOf(assignment);
      return Array.isArray(order?.service_requests) ? order.service_requests[0] : order?.service_requests;
    };
    const statusLabel = (status) => {
      const map = {
        accepted: "Қабул қилинган",
        in_progress: "Жараёнда",
        completed: "Якунланган",
        canceled_admin: "Бекор қилинган"
      };
      return map[status] || status;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_LoadingState = __nuxt_component_2;
      const _component_ErrorState = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "ff-shell min-h-dvh px-4 py-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AppHeader, {
        title: "Master Orders",
        subtitle: "Менинг буюртмаларим",
        "logo-text": "MS",
        "show-back-button": true,
        "back-to": "/"
      }, null, _parent));
      _push(`<main class="mt-4 space-y-3">`);
      if (unref(loading)) {
        _push(ssrRenderComponent(_component_LoadingState, {
          label: unref(t)("common.loading")
        }, null, _parent));
      } else if (unref(errorMessage)) {
        _push(ssrRenderComponent(_component_ErrorState, {
          title: unref(t)("common.unexpectedError"),
          message: unref(errorMessage),
          "retry-label": unref(t)("common.retry"),
          onRetry: loadOrders
        }, null, _parent));
      } else if (unref(assignments).length === 0) {
        _push(`<section class="ff-panel rounded-3xl p-4"><p class="text-sm text-slate-600">Ҳозирча сизга бириктирилган буюртмалар йўқ.</p></section>`);
      } else {
        _push(`<!--[-->`);
        ssrRenderList(unref(assignments), (assignment) => {
          _push(`<section class="ff-panel rounded-3xl p-4 space-y-2"><div class="flex items-start justify-between gap-3"><p class="text-sm font-bold">${ssrInterpolate(requestOf(assignment)?.public_code)}</p><span class="rounded-full bg-[#eee9ff] px-2 py-1 text-xs font-semibold text-[#5c4bd6]">${ssrInterpolate(statusLabel(orderOf(assignment)?.status))}</span></div><p class="text-sm text-slate-700">${ssrInterpolate(requestOf(assignment)?.problem_summary || "-")}</p><p class="text-xs text-slate-500">Вақт: ${ssrInterpolate(requestOf(assignment)?.visit_time_at ? new Date(requestOf(assignment)?.visit_time_at).toLocaleString() : requestOf(assignment)?.visit_time_mode || "-")}</p><p class="text-xs text-slate-500">Комиссия: ${ssrInterpolate(orderOf(assignment)?.commission_amount ? `${orderOf(assignment)?.commission_amount} сўм` : "сумма киритилмаган")}</p></section>`);
        });
        _push(`<!--]-->`);
      }
      _push(`</main></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/master/orders/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };;globalThis.__timing__.logEnd('Load chunks/build/index-4tBDiwXj');
//# sourceMappingURL=index-4tBDiwXj.mjs.map
