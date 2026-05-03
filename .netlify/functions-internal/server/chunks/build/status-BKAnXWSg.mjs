globalThis.__timing__.logStart('Load chunks/build/status-BKAnXWSg');import { u as useAppI18n, _ as __nuxt_component_0, a as __nuxt_component_2, b as __nuxt_component_3$1 } from './ErrorState-iIpWDbpG.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { j as useRoute, b as _sfc_main$8, n as navigateTo } from './server.mjs';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "RequestSummaryCard",
  __ssrInlineRender: true,
  props: {
    title: {},
    request: {},
    labels: {},
    statusText: {},
    statusClass: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "ff-panel ff-rise rounded-[28px] p-4" }, _attrs))}><p class="text-xs font-bold uppercase tracking-wide text-[#7d78a6]">${ssrInterpolate(props.title)}</p><dl class="mt-3 space-y-2 text-sm text-[#2b2853]"><div class="flex items-center justify-between gap-3"><dt class="text-[#7d78a6]">${ssrInterpolate(props.labels?.id || "ID")}</dt><dd class="ff-pressed rounded-full px-2.5 py-1 text-xs font-semibold text-[#5c4bd6]">${ssrInterpolate(props.request.public_code)}</dd></div><div class="flex items-center justify-between gap-3"><dt class="text-[#7d78a6]">${ssrInterpolate(props.labels?.status || "Status")}</dt><dd class="${ssrRenderClass([props.statusClass || "border border-[#ddd5ff] bg-[#f4f0ff] text-[#7d78a6]", "ff-status-chip"])}">${ssrInterpolate(props.statusText || props.request.status)}</dd></div>`);
      if (props.request.problem_summary) {
        _push(`<div class="pt-1"><dt class="text-[#7d78a6]">${ssrInterpolate(props.labels?.summary || "Summary")}</dt><dd class="mt-1 font-medium leading-5">${ssrInterpolate(props.request.problem_summary)}</dd></div>`);
      } else {
        _push(`<!---->`);
      }
      if (props.request.address_text) {
        _push(`<div class="pt-1"><dt class="text-[#7d78a6]">${ssrInterpolate(props.labels?.address || "Address")}</dt><dd class="mt-1 font-medium leading-5">${ssrInterpolate(props.request.address_text)}</dd></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</dl></section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RequestSummaryCard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main$1, { __name: "RequestSummaryCard" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "status",
  __ssrInlineRender: true,
  setup(__props) {
    const api = useRequesterApi();
    const route = useRoute();
    const { t } = useAppI18n();
    const loading = ref(true);
    const refreshing = ref(false);
    const cancelling = ref(false);
    const request = ref(null);
    const errorMessage = ref("");
    const noticeMessage = ref("");
    const requestId = computed(() => String(route.params.requestId || ""));
    const cancellableStatuses = ["draft", "intake_in_progress", "ready_for_dispatch", "dispatched", "in_fulfillment"];
    const cancellableStatusSet = new Set(cancellableStatuses);
    const canCancel = computed(() => {
      if (!request.value || cancelling.value) return false;
      return cancellableStatusSet.has(request.value.status);
    });
    const canContinueIntake = computed(() => {
      if (!request.value) return false;
      return request.value.status === "draft" || request.value.status === "intake_in_progress" || request.value.status === "ready_for_dispatch";
    });
    const summaryLabels = computed(() => ({
      id: t("requester.summaryId"),
      status: t("requester.summaryStatus"),
      summary: t("requester.summaryProblem"),
      address: t("requester.summaryAddress")
    }));
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
      if (status === "closed_canceled_user" || status === "closed_canceled_admin") return "border border-[#ffb8c0] bg-[#fff0f2] text-[#b3475b]";
      return "border border-[#ddd5ff] bg-[#f4f0ff] text-[#7d78a6]";
    };
    const statusStep = (status) => {
      if (status === "draft" || status === "intake_in_progress") return 1;
      if (status === "ready_for_dispatch" || status === "dispatched") return 2;
      if (status === "in_fulfillment") return 3;
      return 4;
    };
    const load = async (silent = false) => {
      if (silent) {
        refreshing.value = true;
      } else {
        loading.value = true;
      }
      errorMessage.value = "";
      noticeMessage.value = "";
      try {
        const result = await api.getRequest(requestId.value);
        request.value = result.data;
      } catch (error) {
        errorMessage.value = error?.data?.error?.message || t("common.unexpectedError");
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    };
    const cancelRequest = async () => {
      if (!request.value || !canCancel.value) return;
      cancelling.value = true;
      errorMessage.value = "";
      noticeMessage.value = "";
      try {
        const result = await api.cancelRequest(request.value.id);
        request.value = {
          ...request.value,
          status: result.data.status
        };
        if (result.data.admin_review_required) {
          noticeMessage.value = t("requester.cancelSentToAdmin");
        }
      } catch (error) {
        errorMessage.value = error?.data?.error?.message || t("common.unexpectedError");
      } finally {
        cancelling.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_LoadingState = __nuxt_component_2;
      const _component_ErrorState = __nuxt_component_3$1;
      const _component_RequestSummaryCard = __nuxt_component_3;
      const _component_UButton = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "ff-shell min-h-dvh" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AppHeader, {
        title: unref(t)("requester.statusTitle"),
        subtitle: unref(t)("common.status"),
        "logo-text": "FF",
        "show-back-button": true,
        "back-to": "/requester"
      }, null, _parent));
      _push(`<main class="space-y-4 px-4 py-4">`);
      if (unref(loading)) {
        _push(ssrRenderComponent(_component_LoadingState, {
          label: unref(t)("requester.loadingRequest")
        }, null, _parent));
      } else if (!unref(request) && unref(errorMessage)) {
        _push(ssrRenderComponent(_component_ErrorState, {
          title: unref(t)("common.unexpectedError"),
          message: unref(errorMessage),
          "retry-label": unref(t)("common.retry"),
          onRetry: ($event) => load()
        }, null, _parent));
      } else if (unref(request)) {
        _push(`<!--[--><section class="ff-warm-panel ff-rise rounded-[30px] p-4"><p class="text-xs font-bold uppercase tracking-wide text-[#7d78a6]">${ssrInterpolate(unref(t)("common.status"))}</p><div class="mt-2 flex items-center justify-between gap-3"><p class="text-sm font-bold text-[#2b2853]">${ssrInterpolate(unref(request).public_code)}</p><span class="${ssrRenderClass([statusToneClass(unref(request).status), "ff-status-chip"])}">${ssrInterpolate(statusLabel(unref(request).status))}</span></div><div class="mt-3 grid grid-cols-4 gap-1.5"><!--[-->`);
        ssrRenderList(4, (n) => {
          _push(`<div class="${ssrRenderClass([n <= statusStep(unref(request).status) ? "bg-[#7358e8] shadow-[0_2px_8px_rgba(115,88,232,0.28)]" : "ff-pressed", "h-1.5 rounded-full"])}"></div>`);
        });
        _push(`<!--]--></div></section>`);
        _push(ssrRenderComponent(_component_RequestSummaryCard, {
          title: unref(t)("requester.summaryTitle"),
          request: unref(request),
          labels: unref(summaryLabels),
          "status-text": statusLabel(unref(request).status),
          "status-class": statusToneClass(unref(request).status)
        }, null, _parent));
        if (unref(errorMessage)) {
          _push(ssrRenderComponent(_component_ErrorState, {
            title: unref(t)("common.unexpectedError"),
            message: unref(errorMessage),
            "retry-label": unref(t)("common.retry"),
            onRetry: ($event) => load()
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(noticeMessage)) {
          _push(`<section class="ff-panel-soft rounded-2xl p-3"><p class="text-sm font-medium text-[#5c4bd6]">${ssrInterpolate(unref(noticeMessage))}</p></section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<section class="ff-panel ff-rise rounded-[28px] p-3"><div class="flex flex-wrap gap-2">`);
        _push(ssrRenderComponent(_component_UButton, {
          color: "neutral",
          variant: "soft",
          class: "font-semibold",
          loading: unref(refreshing),
          onClick: ($event) => load(true)
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
        if (unref(canContinueIntake)) {
          _push(ssrRenderComponent(_component_UButton, {
            color: "primary",
            variant: "soft",
            class: "font-semibold",
            onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/requester/requests/${unref(request).id}/intake`)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("requester.continueIntake"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("requester.continueIntake")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(canCancel)) {
          _push(ssrRenderComponent(_component_UButton, {
            color: "error",
            variant: "soft",
            class: "font-semibold",
            loading: unref(cancelling),
            onClick: cancelRequest
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(t)("requester.cancelRequest"))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(t)("requester.cancelRequest")), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (!unref(canCancel)) {
          _push(`<p class="mt-2 text-xs text-[#7d78a6]">${ssrInterpolate(unref(t)("requester.cancelBlocked"))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section><!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/requester/requests/[requestId]/status.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };;globalThis.__timing__.logEnd('Load chunks/build/status-BKAnXWSg');
//# sourceMappingURL=status-BKAnXWSg.mjs.map
