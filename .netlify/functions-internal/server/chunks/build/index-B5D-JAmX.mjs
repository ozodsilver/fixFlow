globalThis.__timing__.logStart('Load chunks/build/index-B5D-JAmX');import { u as useAppI18n, _ as __nuxt_component_0, a as __nuxt_component_2, b as __nuxt_component_3 } from './ErrorState-iIpWDbpG.mjs';
import { h as _sfc_main$e, b as _sfc_main$8, n as navigateTo } from './server.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "EmptyState",
  __ssrInlineRender: true,
  props: {
    title: {},
    description: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "ff-panel-soft ff-rise rounded-[28px] border-dashed p-6 text-center" }, _attrs))}><div class="ff-icon-tile mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-inbox",
        class: "size-4"
      }, null, _parent));
      _push(`</div><p class="text-sm font-bold text-[#2b2853]">${ssrInterpolate(props.title)}</p>`);
      if (props.description) {
        _push(`<p class="mt-1 text-xs leading-5 text-[#7d78a6]">${ssrInterpolate(props.description)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/EmptyState.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_4 = Object.assign(_sfc_main$2, { __name: "EmptyState" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ServiceDomainCard",
  __ssrInlineRender: true,
  props: {
    domain: {},
    title: {},
    subtitle: {}
  },
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const domainIcon = computed(() => {
      const slug = props.domain.slug.toLowerCase();
      if (slug.includes("plumb")) return "i-lucide-wrench";
      if (slug.includes("appliance")) return "i-lucide-refrigerator";
      if (slug.includes("elect")) return "i-lucide-zap";
      return "i-lucide-shield-check";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      _push(`<button${ssrRenderAttrs(mergeProps({
        type: "button",
        class: "ff-service-card group min-h-[150px] w-full rounded-[26px] p-3 text-left transition hover:-translate-y-0.5"
      }, _attrs))}><div class="flex h-full flex-col justify-between gap-3"><div class="flex items-start justify-between gap-2"><div class="ff-icon-tile flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px]">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: unref(domainIcon),
        class: "size-7"
      }, null, _parent));
      _push(`</div><span class="ff-pressed flex h-8 w-8 shrink-0 items-center justify-center rounded-full">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-chevron-right",
        class: "size-5 text-[#7358e8] transition group-hover:text-[#ff8f9c]"
      }, null, _parent));
      _push(`</span></div><div class="min-w-0"><p class="line-clamp-2 text-[13px] font-extrabold leading-4 text-[#2b2853]">${ssrInterpolate(props.title)}</p>`);
      if (props.subtitle) {
        _push(`<p class="mt-1 text-[11px] leading-4 text-[#7d78a6]">${ssrInterpolate(props.subtitle)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></button>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ServiceDomainCard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main$1, { __name: "ServiceDomainCard" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const api = useRequesterApi();
    const { t, locale } = useAppI18n();
    const loading = ref(true);
    const domains = ref([]);
    const requests = ref([]);
    const errorMessage = ref("");
    const creatingRequestDomainId = ref(null);
    const localizedDomainName = (domain) => locale.value === "ru" ? domain.name_ru : domain.name_uz_cyrl;
    const statusLabel = (status) => {
      const map = {
        draft: t("requester.statusDraft"),
        intake_in_progress: t("requester.statusIntakeInProgress"),
        ready_for_dispatch: t("requester.statusReadyForDispatch"),
        dispatched: t("requester.statusDispatched"),
        in_fulfillment: t("requester.statusInFulfillment"),
        closed_completed: t("requester.statusClosedCompleted"),
        closed_canceled_user: t("requester.statusClosedCanceledUser"),
        closed_canceled_admin: t("requester.statusClosedCanceledAdmin"),
        closed_unfulfilled: t("requester.statusClosedUnfulfilled")
      };
      return map[status] || status;
    };
    const statusToneClass = (status) => {
      if (status === "draft" || status === "intake_in_progress") return "border border-[#ffd3b0] bg-[#fff1df] text-[#9b673d]";
      if (status === "ready_for_dispatch" || status === "dispatched") return "border border-[#cfc5ff] bg-[#eee9ff] text-[#5c4bd6]";
      if (status === "in_fulfillment") return "border border-[#a8ead5] bg-[#e5fbf4] text-[#26866e]";
      if (status === "closed_completed") return "border border-[#a8ead5] bg-[#e8fff7] text-[#26866e]";
      return "border border-[#ddd5ff] bg-[#f4f0ff] text-[#7d78a6]";
    };
    const topRequests = computed(() => requests.value.slice(0, 5));
    const formatRequestDate = (value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return new Intl.DateTimeFormat(locale.value === "ru" ? "ru-RU" : "uz-Cyrl-UZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(date);
    };
    const tryTelegramAuth = async () => {
      return;
    };
    const init = async () => {
      loading.value = true;
      errorMessage.value = "";
      try {
        const [domainsRes, requestsRes] = await Promise.all([api.getServiceDomains(), api.getRequests()]);
        domains.value = domainsRes.data;
        requests.value = requestsRes.data.items;
      } catch (error) {
        const firstCode = error?.data?.error?.code;
        const firstStatus = error?.statusCode;
        if (firstCode === "auth.session_expired" || firstStatus === 401) {
          try {
            await tryTelegramAuth();
            const [domainsRes, requestsRes] = await Promise.all([api.getServiceDomains(), api.getRequests()]);
            domains.value = domainsRes.data;
            requests.value = requestsRes.data.items;
            return;
          } catch (authError) {
            const authCode = authError?.data?.error?.code;
            const authMessage = authError?.data?.error?.message || "";
            if (authCode === "auth.invalid_init_data" || authError.message === "auth.invalid_init_data") {
              if (authMessage.includes("not configured")) {
                errorMessage.value = "Server sozlamasida Telegram bot token kiritilmagan.";
              } else {
                errorMessage.value = "Mini Appni bot ichidagi 'Open App' tugmasidan oching.";
              }
            } else {
              errorMessage.value = authError?.data?.error?.message || t("common.unexpectedError");
            }
          }
        } else {
          errorMessage.value = error?.data?.error?.message || t("common.unexpectedError");
        }
      } finally {
        loading.value = false;
      }
    };
    const openDomain = async (domain) => {
      creatingRequestDomainId.value = domain.id;
      try {
        const created = await api.createRequest({
          domain_id: domain.id,
          locale: locale.value
        });
        await navigateTo(`/requester/requests/${created.data.request_id}/intake`);
      } catch (error) {
        errorMessage.value = error?.data?.error?.message || t("common.unexpectedError");
      } finally {
        creatingRequestDomainId.value = null;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_UIcon = _sfc_main$e;
      const _component_LoadingState = __nuxt_component_2;
      const _component_ErrorState = __nuxt_component_3;
      const _component_EmptyState = __nuxt_component_4;
      const _component_ServiceDomainCard = __nuxt_component_5;
      const _component_UButton = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "ff-shell min-h-dvh" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AppHeader, {
        title: unref(t)("common.appName"),
        subtitle: unref(t)("requester.homeSubtitle"),
        "logo-text": "FF"
      }, null, _parent));
      _push(`<main class="space-y-5 px-4 py-4"><section class="ff-warm-panel ff-rise rounded-[30px] p-4"><div class="flex items-center gap-3"><div class="ff-primary-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-life-buoy",
        class: "size-5"
      }, null, _parent));
      _push(`</div><div class="min-w-0"><p class="text-sm font-extrabold text-[#2b2853]">${ssrInterpolate(unref(t)("requester.homeTitle"))}</p><p class="mt-1 text-xs leading-5 text-[#7d78a6]">${ssrInterpolate(unref(t)("requester.homeSubtitle"))}</p></div></div></section>`);
      if (unref(loading)) {
        _push(ssrRenderComponent(_component_LoadingState, {
          label: unref(t)("common.loading")
        }, null, _parent));
      } else if (unref(errorMessage)) {
        _push(ssrRenderComponent(_component_ErrorState, {
          title: unref(t)("common.unexpectedError"),
          message: unref(errorMessage),
          "retry-label": unref(t)("common.retry"),
          onRetry: init
        }, null, _parent));
      } else if (unref(domains).length === 0) {
        _push(ssrRenderComponent(_component_EmptyState, {
          title: unref(t)("common.noData"),
          description: unref(t)("requester.noDomains")
        }, null, _parent));
      } else {
        _push(`<div class="space-y-3"><div class="flex items-center justify-between"><h2 class="ff-section-title">${ssrInterpolate(unref(t)("requester.homeTitle"))}</h2><span class="ff-pressed rounded-full px-2.5 py-1 text-[11px] font-bold text-[#5c4bd6]">${ssrInterpolate(unref(domains).length)}</span></div><div class="grid grid-cols-2 gap-3"><!--[-->`);
        ssrRenderList(unref(domains), (domain) => {
          _push(ssrRenderComponent(_component_ServiceDomainCard, {
            key: domain.id,
            domain,
            title: localizedDomainName(domain),
            subtitle: unref(t)("requester.openChat"),
            onSelect: openDomain
          }, null, _parent));
        });
        _push(`<!--]--></div></div>`);
      }
      if (!unref(loading)) {
        _push(`<section class="space-y-2"><div class="flex items-center justify-between gap-2"><h3 class="ff-section-title">${ssrInterpolate(unref(t)("requester.myRequestsTitle"))}</h3>`);
        _push(ssrRenderComponent(_component_UButton, {
          size: "xs",
          color: "neutral",
          variant: "ghost",
          onClick: init
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("common.refresh"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("common.refresh")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (unref(topRequests).length === 0) {
          _push(ssrRenderComponent(_component_EmptyState, {
            title: unref(t)("requester.noRequestsTitle"),
            description: unref(t)("requester.noRequestsDescription")
          }, null, _parent));
        } else {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(topRequests), (request) => {
            _push(`<button type="button" class="ff-panel ff-rise w-full rounded-[24px] p-3 text-left transition hover:-translate-y-0.5"><div class="flex items-start justify-between gap-2"><div class="min-w-0"><p class="text-sm font-bold text-[#2b2853]">${ssrInterpolate(request.public_code)}</p><p class="mt-1 truncate text-xs text-[#7d78a6]">${ssrInterpolate(request.problem_summary || unref(t)("requester.openChat"))}</p><p class="mt-1 text-xs font-medium text-[#8f88ad]">${ssrInterpolate(formatRequestDate(request.created_at))}</p><p class="mt-1"><span class="${ssrRenderClass([statusToneClass(request.status), "ff-status-chip"])}">${ssrInterpolate(statusLabel(request.status))}</span></p></div><span class="ff-pressed rounded-full px-2 py-1 text-[11px] font-semibold text-[#5c4bd6]">${ssrInterpolate(unref(t)("common.open"))}</span></div></button>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</main>`);
      if (unref(creatingRequestDomainId)) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-[#2b2853]/30 backdrop-blur-sm"><div class="ff-panel-soft rounded-2xl px-4 py-3"><div class="flex items-center gap-3"><div class="ff-primary-gradient flex h-14 w-14 items-center justify-center rounded-2xl">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-loader-2",
          class: "size-7 animate-spin text-white [--icon-stroke-width:2.5]"
        }, null, _parent));
        _push(`</div><p class="text-sm font-semibold text-[#7d78a6]">${ssrInterpolate(unref(t)("common.loading"))}</p></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/requester/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };;globalThis.__timing__.logEnd('Load chunks/build/index-B5D-JAmX');
//# sourceMappingURL=index-B5D-JAmX.mjs.map
