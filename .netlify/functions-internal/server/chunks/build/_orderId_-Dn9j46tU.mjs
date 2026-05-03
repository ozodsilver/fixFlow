globalThis.__timing__.logStart('Load chunks/build/_orderId_-Dn9j46tU');import { u as useAppI18n, _ as __nuxt_component_0, a as __nuxt_component_2, b as __nuxt_component_3 } from './ErrorState-iIpWDbpG.mjs';
import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { j as useRoute, k as useRuntimeConfig } from './server.mjs';
import { u as useRequesterApi } from './useRequesterApi-Cs76guEi.mjs';
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
  __name: "[orderId]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { t, locale } = useAppI18n();
    const api = useRequesterApi();
    const loading = ref(true);
    const errorMessage = ref("");
    const assignment = ref(null);
    const orderId = computed(() => String(route.params.orderId || ""));
    const getErrorMessage = (error) => error?.data?.error?.message || error?.data?.message || error?.message || t("common.unexpectedError");
    const tryTelegramAuth = async () => {
      const runtimeConfig = useRuntimeConfig();
      if (runtimeConfig.public.allowDevAuthBypass) {
        const devTelegramUserId = Number(sessionStorage.getItem("ff_dev_tg_uid") || "900001");
        sessionStorage.setItem("ff_dev_tg_uid", String(devTelegramUserId));
        await api.initAuth({ telegram_user_id: devTelegramUserId, display_name: "Dev Local Master", locale: locale.value });
      }
    };
    const loadOrder = async () => {
      loading.value = true;
      errorMessage.value = "";
      try {
        const res = await $fetch(`/api/v1/master/orders/${orderId.value}`);
        assignment.value = res.data.assignment;
      } catch (error) {
        const code = error?.data?.error?.code;
        const statusCode = error?.statusCode;
        if (code === "auth.session_expired" || statusCode === 401) {
          try {
            await tryTelegramAuth();
            const res = await $fetch(`/api/v1/master/orders/${orderId.value}`);
            assignment.value = res.data.assignment;
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
    const order = computed(() => {
      const value = assignment.value?.orders;
      return Array.isArray(value) ? value[0] : value;
    });
    const request = computed(() => {
      const value = order.value?.service_requests;
      return Array.isArray(value) ? value[0] : value;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_LoadingState = __nuxt_component_2;
      const _component_ErrorState = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "ff-shell min-h-dvh px-4 py-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AppHeader, {
        title: "Buyurtma",
        subtitle: "Тўлиқ маълумот",
        "logo-text": "MS",
        "show-back-button": true,
        "back-to": "/master/orders"
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
          onRetry: loadOrder
        }, null, _parent));
      } else if (unref(assignment) && unref(order) && unref(request)) {
        _push(`<!--[--><section class="ff-panel rounded-3xl p-4 space-y-2"><div class="flex items-start justify-between gap-3"><p class="text-sm font-bold">${ssrInterpolate(unref(request).public_code)}</p><span class="rounded-full bg-[#eee9ff] px-2 py-1 text-xs font-semibold text-[#5c4bd6]">${ssrInterpolate(unref(order).status)}</span></div><p class="text-sm text-slate-700">${ssrInterpolate(unref(request).problem_summary || "-")}</p></section><section class="ff-panel rounded-3xl p-4 space-y-2"><p class="text-xs font-bold uppercase tracking-wide text-violet-700">Мижоз маълумотлари</p><p class="text-sm text-slate-700">Телефон: <span class="font-semibold">${ssrInterpolate(unref(request).phone_e164 || "-")}</span></p><p class="text-sm text-slate-700">Манзил: <span class="font-semibold">${ssrInterpolate(unref(request).address_text || "-")}</span></p>`);
        if (unref(request).landmark_text) {
          _push(`<p class="text-sm text-slate-700">Мўлжал: <span class="font-semibold">${ssrInterpolate(unref(request).landmark_text)}</span></p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<p class="text-sm text-slate-700">Вақт: <span class="font-semibold">${ssrInterpolate(unref(request).visit_time_at ? new Date(unref(request).visit_time_at).toLocaleString() : unref(request).visit_time_mode || "-")}</span></p></section><section class="ff-panel rounded-3xl p-4 space-y-2"><p class="text-xs font-bold uppercase tracking-wide text-violet-700">Комиссия</p><p class="text-sm text-slate-700">Фоиз: ${ssrInterpolate(unref(order).commission_percent)}%</p><p class="text-sm text-slate-700">Иш суммаси: ${ssrInterpolate(unref(order).final_price_amount ? `${unref(order).final_price_amount} сўм` : "админ киритади")}</p><p class="text-sm text-slate-700">Админ улуши: ${ssrInterpolate(unref(order).commission_amount ? `${unref(order).commission_amount} сўм` : "-")}</p><p class="text-sm text-slate-700">Ҳолат: ${ssrInterpolate(unref(order).commission_status)}</p></section><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</main></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/master/orders/[orderId].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };;globalThis.__timing__.logEnd('Load chunks/build/_orderId_-Dn9j46tU');
//# sourceMappingURL=_orderId_-Dn9j46tU.mjs.map
