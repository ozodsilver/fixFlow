globalThis.__timing__.logStart('Load chunks/build/_dispatchId_-CJI-c24L');import { u as useAppI18n, _ as __nuxt_component_0, a as __nuxt_component_2, b as __nuxt_component_3 } from './ErrorState-iIpWDbpG.mjs';
import { j as useRoute, b as _sfc_main$8, n as navigateTo, k as useRuntimeConfig } from './server.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
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
  __name: "[dispatchId]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { t, locale } = useAppI18n();
    const api = useRequesterApi();
    const loading = ref(true);
    const claiming = ref(false);
    const errorMessage = ref("");
    const successMessage = ref("");
    const dispatch = ref(null);
    const canClaim = computed(() => dispatch.value?.status === "open");
    const isClaimed = computed(() => dispatch.value?.status === "claimed");
    const isClaimedByMe = computed(() => !!dispatch.value?.is_claimed_by_current_master);
    const isClaimedByOther = computed(() => isClaimed.value && !isClaimedByMe.value);
    const dispatchId = computed(() => String(route.params.dispatchId || ""));
    const getErrorMessage = (error) => error?.data?.error?.message || error?.data?.message || error?.message || t("common.unexpectedError");
    const waitForTelegramInitData = async () => {
      for (let i = 0; i < 20; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
      return null;
    };
    const tryTelegramAuth = async () => {
      const runtimeConfig = useRuntimeConfig();
      const initData = await waitForTelegramInitData();
      if (initData) {
        sessionStorage.setItem("ff_tg_init_data", initData);
        await api.initAuth({
          init_data: initData,
          locale: locale.value
        });
        return;
      }
      if (runtimeConfig.public.allowDevAuthBypass) {
        const devTelegramUserId = Number(sessionStorage.getItem("ff_dev_tg_uid") || "900001");
        sessionStorage.setItem("ff_dev_tg_uid", String(devTelegramUserId));
        await api.initAuth({
          telegram_user_id: devTelegramUserId,
          display_name: "Dev Local User",
          locale: locale.value
        });
        return;
      }
    };
    const loadDispatch = async () => {
      loading.value = true;
      errorMessage.value = "";
      try {
        const res = await $fetch(`/api/v1/master/dispatches/${dispatchId.value}`);
        dispatch.value = res.data.dispatch;
      } catch (error) {
        const code = error?.data?.error?.code;
        const statusCode = error?.statusCode;
        if (code === "auth.session_expired" || statusCode === 401) {
          try {
            await tryTelegramAuth();
            const res = await $fetch(`/api/v1/master/dispatches/${dispatchId.value}`);
            dispatch.value = res.data.dispatch;
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
    const claimDispatch = async () => {
      if (!dispatch.value) return;
      claiming.value = true;
      errorMessage.value = "";
      successMessage.value = "";
      try {
        const result = await $fetch(`/api/v1/master/dispatches/${dispatchId.value}/claim`, {
          method: "POST",
          body: {
            idempotency_key: crypto.randomUUID()
          }
        });
        successMessage.value = "Buyurtma qabul qilindi.";
        await loadDispatch();
        if (result.data.order_id) {
          await navigateTo(`/master/orders/${result.data.order_id}`);
        }
      } catch (error) {
        errorMessage.value = getErrorMessage(error);
      } finally {
        claiming.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_LoadingState = __nuxt_component_2;
      const _component_ErrorState = __nuxt_component_3;
      const _component_UButton = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "ff-shell min-h-dvh px-4 py-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AppHeader, {
        title: "Master Dispatch",
        subtitle: "Buyurtma preview",
        "logo-text": "FF",
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
          onRetry: loadDispatch
        }, null, _parent));
      } else if (unref(dispatch)) {
        _push(`<!--[--><section class="ff-panel rounded-3xl p-4"><p class="text-sm font-bold">${ssrInterpolate(unref(dispatch).request.public_code)}</p><p class="mt-1 text-sm text-slate-700">${ssrInterpolate(unref(dispatch).request.problem_summary || "-")}</p><p class="mt-1 text-xs text-slate-500">Muammo turi: ${ssrInterpolate(unref(dispatch).request.issue_custom || "-")}</p><p class="mt-1 text-xs text-slate-500">Status: ${ssrInterpolate(unref(dispatch).status)}</p><p class="mt-1 text-xs text-slate-500">Telefon: ${ssrInterpolate(unref(dispatch).request.phone_e164 || "claimdan keyin ochiladi")}</p><p class="mt-1 text-xs text-slate-500">Manzil: ${ssrInterpolate(unref(dispatch).request.address_text || "claimdan keyin ochiladi")}</p></section>`);
        _push(ssrRenderComponent(_component_UButton, {
          color: "primary",
          class: "w-full justify-center font-semibold",
          loading: unref(claiming),
          disabled: !unref(canClaim),
          onClick: claimDispatch
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Buyurtmani qabul qilish `);
            } else {
              return [
                createTextVNode(" Buyurtmani qabul qilish ")
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(successMessage) || unref(isClaimedByMe)) {
          _push(`<p class="text-sm font-semibold text-emerald-700">${ssrInterpolate(unref(successMessage) || "Buyurtma qabul qilindi.")}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(isClaimedByOther)) {
          _push(`<p class="text-sm font-semibold text-rose-700">Bu buyurtma boshqa masterga berildi.</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/master/dispatches/[dispatchId].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };;globalThis.__timing__.logEnd('Load chunks/build/_dispatchId_-CJI-c24L');
//# sourceMappingURL=_dispatchId_-CJI-c24L.mjs.map
