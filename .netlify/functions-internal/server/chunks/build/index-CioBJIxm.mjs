globalThis.__timing__.logStart('Load chunks/build/index-CioBJIxm');import { _ as __nuxt_component_0, a as __nuxt_component_2, b as __nuxt_component_3 } from './ErrorState-iIpWDbpG.mjs';
import { _ as _sfc_main$1, a as _sfc_main$2 } from './Input-DMm2Wy-o.mjs';
import { b as _sfc_main$8, h as _sfc_main$e } from './server.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, isRef, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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
    const loggedIn = ref(false);
    const loading = ref(true);
    const actionLoadingId = ref(null);
    const errorMessage = ref("");
    const activeSection = ref("dispatch");
    const login = ref("");
    const password = ref("");
    const pendingDispatchItems = ref([]);
    const dispatchHistoryItems = ref([]);
    const pendingItems = ref([]);
    const historyItems = ref([]);
    const orderItems = ref([]);
    const orderDrafts = ref({});
    const masterItems = ref([]);
    const activeSubtitle = computed(
      () => activeSection.value === "dispatch" ? "Актив" : activeSection.value === "orders" ? "Буюртмалар" : activeSection.value === "masters" ? "Усталар" : "Бекор қилинган"
    );
    const unpaidCommissionTotal = computed(
      () => orderItems.value.reduce((total, item) => item.commission_status === "unpaid" ? total + Number(item.commission_amount || 0) : total, 0)
    );
    const loadItems = async () => {
      loading.value = true;
      errorMessage.value = "";
      try {
        const [dispatchRes, cancelRes, ordersRes, mastersRes] = await Promise.all([
          $fetch("/api/v1/admin/dispatch-reviews"),
          $fetch("/api/v1/admin/cancel-requests"),
          $fetch("/api/v1/admin/orders"),
          $fetch("/api/v1/admin/masters")
        ]);
        pendingDispatchItems.value = dispatchRes.data.pending || [];
        dispatchHistoryItems.value = dispatchRes.data.history || [];
        pendingItems.value = cancelRes.data.pending || [];
        historyItems.value = cancelRes.data.history || [];
        orderItems.value = ordersRes.data.items || [];
        masterItems.value = mastersRes.data.items || [];
        orderDrafts.value = Object.fromEntries(orderItems.value.map((item) => [
          item.id,
          {
            final_price_amount: item.final_price_amount ? String(item.final_price_amount) : "",
            admin_note: item.admin_note || ""
          }
        ]));
      } catch (error) {
        errorMessage.value = error?.data?.error?.message || "Failed to load";
      } finally {
        loading.value = false;
      }
    };
    const currentAssignment = (item) => item.order_assignments?.find((assignment) => assignment.is_current) || item.order_assignments?.[0] || null;
    const normalizeRelated = (value) => Array.isArray(value) ? value[0] || null : value || null;
    const requestOfOrder = (item) => normalizeRelated(item.service_requests);
    const requesterOfOrder = (item) => normalizeRelated(requestOfOrder(item)?.users);
    const masterOfOrder = (item) => normalizeRelated(currentAssignment(item)?.users);
    const masterProfileOf = (item) => normalizeRelated(item.master_profiles);
    const masterStatusOf = (item) => masterProfileOf(item)?.approval_status || "not_master";
    const pendingMastersCount = computed(
      () => masterItems.value.filter((item) => masterStatusOf(item) === "pending" || masterStatusOf(item) === "not_master").length
    );
    const orderDraftAmountText = (item) => {
      const raw = orderDrafts.value[item.id]?.final_price_amount;
      if (raw === null || raw === void 0) return "";
      return String(raw).trim();
    };
    const draftFinalPriceOf = (item) => {
      const raw = orderDraftAmountText(item);
      if (!raw) return item.final_price_amount || null;
      const amount = Number(raw);
      return Number.isFinite(amount) && amount >= 0 ? Math.floor(amount) : null;
    };
    const commissionPreviewOf = (item) => {
      const amount = draftFinalPriceOf(item);
      if (amount === null) return item.commission_amount || null;
      return Math.ceil(amount * Number(item.commission_percent || 5) / 100);
    };
    const updateOrder = async (item, extra = {}) => {
      actionLoadingId.value = item.id;
      errorMessage.value = "";
      const draft = orderDrafts.value[item.id] || { final_price_amount: "", admin_note: "" };
      const amountText = draft.final_price_amount === null || draft.final_price_amount === void 0 ? "" : String(draft.final_price_amount).trim();
      const amount = amountText ? Number(amountText) : null;
      try {
        await $fetch(`/api/v1/admin/orders/${item.id}/update`, {
          method: "POST",
          body: {
            final_price_amount: amount,
            admin_note: draft.admin_note,
            ...extra
          }
        });
        await loadItems();
      } catch (error) {
        errorMessage.value = error?.data?.error?.message || "Order update failed";
      } finally {
        actionLoadingId.value = null;
      }
    };
    const updateMasterStatus = async (item, status) => {
      actionLoadingId.value = item.id;
      errorMessage.value = "";
      try {
        await $fetch(`/api/v1/admin/masters/${item.id}/status`, {
          method: "POST",
          body: { status }
        });
        await loadItems();
      } catch (error) {
        errorMessage.value = error?.data?.error?.message || "Master update failed";
      } finally {
        actionLoadingId.value = null;
      }
    };
    const submitLogin = async () => {
      errorMessage.value = "";
      try {
        await $fetch("/api/v1/admin/auth/login", {
          method: "POST",
          body: { login: login.value.trim(), password: password.value }
        });
        loggedIn.value = true;
        await loadItems();
      } catch (error) {
        errorMessage.value = error?.data?.error?.message || "Login failed";
      }
    };
    const reviewDispatch = async (id, action) => {
      actionLoadingId.value = id;
      errorMessage.value = "";
      try {
        await $fetch(`/api/v1/admin/dispatch-reviews/${id}/review`, {
          method: "POST",
          body: { action }
        });
        await loadItems();
      } catch (error) {
        errorMessage.value = error?.data?.error?.message || "Review failed";
      } finally {
        actionLoadingId.value = null;
      }
    };
    const review = async (id, action) => {
      actionLoadingId.value = id;
      errorMessage.value = "";
      try {
        await $fetch(`/api/v1/admin/cancel-requests/${id}/review`, {
          method: "POST",
          body: { action }
        });
        await loadItems();
      } catch (error) {
        errorMessage.value = error?.data?.error?.message || "Review failed";
      } finally {
        actionLoadingId.value = null;
      }
    };
    const logout = async () => {
      await $fetch("/api/v1/admin/auth/logout", { method: "POST" });
      loggedIn.value = false;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_UFormField = _sfc_main$1;
      const _component_UInput = _sfc_main$2;
      const _component_UButton = _sfc_main$8;
      const _component_LoadingState = __nuxt_component_2;
      const _component_ErrorState = __nuxt_component_3;
      const _component_UIcon = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["ff-shell min-h-dvh px-4 py-4", unref(loggedIn) ? "pb-28" : ""]
      }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AppHeader, {
        title: "Admin Panel",
        subtitle: unref(activeSubtitle),
        "logo-text": "AD",
        "show-back-button": true,
        "back-to": "/"
      }, null, _parent));
      _push(`<main class="mt-4 space-y-4">`);
      if (!unref(loggedIn)) {
        _push(`<section class="ff-panel rounded-3xl p-4 space-y-3">`);
        _push(ssrRenderComponent(_component_UFormField, {
          label: "Login",
          required: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(login),
                "onUpdate:modelValue": ($event) => isRef(login) ? login.value = $event : null,
                placeholder: "admin",
                class: "w-full"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(login),
                  "onUpdate:modelValue": ($event) => isRef(login) ? login.value = $event : null,
                  placeholder: "admin",
                  class: "w-full"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, {
          label: "Password",
          required: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(password),
                "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
                type: "password",
                placeholder: "••••••••",
                class: "w-full"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(password),
                  "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
                  type: "password",
                  placeholder: "••••••••",
                  class: "w-full"
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UButton, {
          color: "primary",
          class: "font-semibold",
          onClick: submitLogin
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Kirish`);
            } else {
              return [
                createTextVNode("Kirish")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</section>`);
      } else {
        _push(`<!--[--><div class="flex items-center justify-between"><h2 class="ff-section-title">${ssrInterpolate(unref(activeSection) === "dispatch" ? "Усталарга юбориш кутилаётган мурожаатлар" : unref(activeSection) === "orders" ? "Буюртмалар ва комиссия" : unref(activeSection) === "masters" ? "Усталарни тасдиқлаш" : "Бекор қилиш кутилаётган сўровлар")}</h2>`);
        _push(ssrRenderComponent(_component_UButton, {
          color: "neutral",
          variant: "soft",
          onClick: logout
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Chiqish`);
            } else {
              return [
                createTextVNode("Chiqish")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (unref(loading)) {
          _push(ssrRenderComponent(_component_LoadingState, { label: "Yuklanmoqda..." }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(activeSection) === "dispatch") {
          _push(`<!--[-->`);
          if (!unref(loading) && unref(pendingDispatchItems).length === 0) {
            _push(`<section class="ff-panel rounded-3xl p-4"><p class="text-sm text-slate-600">Усталарга юбориш кутилаётган мурожаатлар ҳозирча йўқ.</p></section>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(unref(pendingDispatchItems), (item) => {
            _push(`<section class="ff-panel rounded-3xl p-4 space-y-2"><p class="text-sm font-bold">${ssrInterpolate(item.service_requests?.public_code)}</p><p class="text-xs text-slate-600">Mijoz: ${ssrInterpolate(item.users?.display_name || "-")}</p><p class="text-xs text-slate-600">Telefon: ${ssrInterpolate(item.users?.phone_e164 || item.service_requests?.phone_e164 || "-")}</p><p class="text-xs text-slate-600">Manzil: ${ssrInterpolate(item.service_requests?.address_text || "-")}</p><p class="text-xs text-slate-600">Muammo: ${ssrInterpolate(item.service_requests?.problem_summary || "-")}</p><p class="text-xs text-slate-500"> Tushgan vaqt: ${ssrInterpolate(new Date(item.created_at).toLocaleString())}</p><div class="flex gap-2 pt-1">`);
            _push(ssrRenderComponent(_component_UButton, {
              color: "primary",
              variant: "soft",
              loading: unref(actionLoadingId) === item.id,
              onClick: ($event) => reviewDispatch(item.id, "approve")
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Усталарга юбориш `);
                } else {
                  return [
                    createTextVNode(" Усталарга юбориш ")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UButton, {
              color: "neutral",
              variant: "soft",
              loading: unref(actionLoadingId) === item.id,
              onClick: ($event) => reviewDispatch(item.id, "reject")
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Рад этиш `);
                } else {
                  return [
                    createTextVNode(" Рад этиш ")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div></section>`);
          });
          _push(`<!--]--><div class="pt-2"><h2 class="ff-section-title">Юборилган мурожаатлар тарихи</h2></div>`);
          if (!unref(loading) && unref(dispatchHistoryItems).length === 0) {
            _push(`<section class="ff-panel rounded-3xl p-4"><p class="text-sm text-slate-600">Юборилган мурожаатлар тарихи ҳозирча йўқ.</p></section>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(unref(dispatchHistoryItems), (item) => {
            _push(`<section class="ff-panel rounded-3xl p-4 space-y-2"><div class="flex items-center justify-between gap-2"><p class="text-sm font-bold">${ssrInterpolate(item.service_requests?.public_code)}</p><span class="${ssrRenderClass([item.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700", "inline-flex rounded-full px-2 py-1 text-xs font-semibold"])}">${ssrInterpolate(item.status === "approved" ? "Усталарга юборилган" : "Рад этилган")}</span></div><p class="text-xs text-slate-600">Mijoz: ${ssrInterpolate(item.users?.display_name || "-")}</p><p class="text-xs text-slate-600">Telefon: ${ssrInterpolate(item.users?.phone_e164 || item.service_requests?.phone_e164 || "-")}</p><p class="text-xs text-slate-600">Muammo: ${ssrInterpolate(item.service_requests?.problem_summary || "-")}</p>`);
            if (item.reviewed_at) {
              _push(`<p class="text-xs text-slate-500"> Ko&#39;rib chiqilgan: ${ssrInterpolate(new Date(item.reviewed_at).toLocaleString())}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</section>`);
          });
          _push(`<!--]--><!--]-->`);
        } else if (unref(activeSection) === "orders") {
          _push(`<!--[--><section class="ff-panel rounded-3xl p-4"><p class="text-xs font-bold uppercase tracking-wide text-violet-700">Умумий назорат</p><p class="mt-1 text-sm text-slate-700">Тўланмаган комиссия: <span class="font-bold">${ssrInterpolate(unref(unpaidCommissionTotal))} сўм</span></p></section>`);
          if (!unref(loading) && unref(orderItems).length === 0) {
            _push(`<section class="ff-panel rounded-3xl p-4"><p class="text-sm text-slate-600">Ҳозирча қабул қилинган буюртмалар йўқ.</p></section>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(unref(orderItems), (item) => {
            _push(`<section class="ff-panel rounded-3xl p-4 space-y-3"><div class="flex items-start justify-between gap-2"><div><p class="text-sm font-bold">${ssrInterpolate(requestOfOrder(item)?.public_code || "-")}</p><p class="mt-1 text-xs text-slate-500">Status: ${ssrInterpolate(item.status)}</p></div><span class="${ssrRenderClass([item.commission_status === "paid" ? "bg-emerald-100 text-emerald-700" : item.commission_status === "unpaid" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600", "rounded-full px-2 py-1 text-xs font-semibold"])}">${ssrInterpolate(item.commission_status)}</span></div><div class="space-y-1 text-xs text-slate-600"><p>Mijoz: ${ssrInterpolate(requesterOfOrder(item)?.display_name || "-")} · ${ssrInterpolate(requestOfOrder(item)?.phone_e164 || requesterOfOrder(item)?.phone_e164 || "-")}</p><p>Master: ${ssrInterpolate(masterOfOrder(item)?.display_name || "-")} · ${ssrInterpolate(masterOfOrder(item)?.phone_e164 || "-")}</p><p>Manzil: ${ssrInterpolate(requestOfOrder(item)?.address_text || "-")}</p><p>Muammo: ${ssrInterpolate(requestOfOrder(item)?.problem_summary || "-")}</p><p>Qabul qilingan: ${ssrInterpolate(new Date(item.created_at).toLocaleString())}</p></div><div class="grid grid-cols-1 gap-2 sm:grid-cols-2">`);
            _push(ssrRenderComponent(_component_UFormField, { label: "Ish summasi" }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UInput, {
                    modelValue: unref(orderDrafts)[item.id].final_price_amount,
                    "onUpdate:modelValue": ($event) => unref(orderDrafts)[item.id].final_price_amount = $event,
                    type: "number",
                    min: "0",
                    placeholder: "Masalan: 200000",
                    class: "w-full"
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: unref(orderDrafts)[item.id].final_price_amount,
                      "onUpdate:modelValue": ($event) => unref(orderDrafts)[item.id].final_price_amount = $event,
                      type: "number",
                      min: "0",
                      placeholder: "Masalan: 200000",
                      class: "w-full"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UFormField, { label: "Admin izohi" }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(ssrRenderComponent(_component_UInput, {
                    modelValue: unref(orderDrafts)[item.id].admin_note,
                    "onUpdate:modelValue": ($event) => unref(orderDrafts)[item.id].admin_note = $event,
                    placeholder: "Ixtiyoriy",
                    class: "w-full"
                  }, null, _parent2, _scopeId));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: unref(orderDrafts)[item.id].admin_note,
                      "onUpdate:modelValue": ($event) => unref(orderDrafts)[item.id].admin_note = $event,
                      placeholder: "Ixtiyoriy",
                      class: "w-full"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div><div class="rounded-2xl bg-slate-50 p-3 text-xs text-slate-700"><p>Комиссия: ${ssrInterpolate(item.commission_percent)}%</p><p>Админ улуши: <span class="font-bold">${ssrInterpolate(commissionPreviewOf(item) ? `${commissionPreviewOf(item)} сўм` : "-")}</span></p>`);
            if (commissionPreviewOf(item) && commissionPreviewOf(item) !== item.commission_amount) {
              _push(`<p class="mt-1 text-[11px] text-amber-700"> Бу ҳали preview. DBга ёзиш учун “Сақлаш”ни босинг. </p>`);
            } else {
              _push(`<!---->`);
            }
            if (item.commission_paid_at) {
              _push(`<p>Тўланган вақт: ${ssrInterpolate(new Date(item.commission_paid_at).toLocaleString())}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="flex flex-wrap gap-2">`);
            _push(ssrRenderComponent(_component_UButton, {
              color: "primary",
              variant: "soft",
              loading: unref(actionLoadingId) === item.id,
              onClick: ($event) => updateOrder(item)
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Сақлаш `);
                } else {
                  return [
                    createTextVNode(" Сақлаш ")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UButton, {
              color: "success",
              variant: "soft",
              loading: unref(actionLoadingId) === item.id,
              onClick: ($event) => updateOrder(item, { commission_status: "paid" })
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Комиссия тўланди `);
                } else {
                  return [
                    createTextVNode(" Комиссия тўланди ")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UButton, {
              color: "neutral",
              variant: "soft",
              loading: unref(actionLoadingId) === item.id,
              disabled: item.status === "completed",
              onClick: ($event) => updateOrder(item, { status: "completed" })
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Иш якунланди `);
                } else {
                  return [
                    createTextVNode(" Иш якунланди ")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div></section>`);
          });
          _push(`<!--]--><!--]-->`);
        } else if (unref(activeSection) === "masters") {
          _push(`<!--[--><section class="ff-panel rounded-3xl p-4"><p class="text-xs font-bold uppercase tracking-wide text-violet-700">Master ruxsatlari</p><p class="mt-1 text-sm text-slate-700"> Янги ёки pending усталар: <span class="font-bold">${ssrInterpolate(unref(pendingMastersCount))}</span></p></section>`);
          if (!unref(loading) && unref(masterItems).length === 0) {
            _push(`<section class="ff-panel rounded-3xl p-4"><p class="text-sm text-slate-600">Ҳозирча Telegram орқали кирган userлар йўқ.</p></section>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(unref(masterItems), (item) => {
            _push(`<section class="ff-panel rounded-3xl p-4 space-y-3"><div class="flex items-start justify-between gap-3"><div class="min-w-0"><p class="truncate text-sm font-bold">${ssrInterpolate(item.display_name)}</p><p class="text-xs text-slate-500">@${ssrInterpolate(item.username || "-")} · TG ${ssrInterpolate(item.telegram_user_id)}</p></div><span class="${ssrRenderClass([masterStatusOf(item) === "approved" ? "bg-emerald-100 text-emerald-700" : masterStatusOf(item) === "revoked" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700", "shrink-0 rounded-full px-2 py-1 text-xs font-semibold"])}">${ssrInterpolate(masterStatusOf(item))}</span></div><div class="space-y-1 text-xs text-slate-600"><p>Telefon: ${ssrInterpolate(item.phone_e164 || "-")}</p><p>Oxirgi kirgan: ${ssrInterpolate(item.last_seen_at ? new Date(item.last_seen_at).toLocaleString() : "-")}</p>`);
            if (masterProfileOf(item)?.approved_at) {
              _push(`<p>Tasdiqlangan: ${ssrInterpolate(new Date(masterProfileOf(item)?.approved_at || "").toLocaleString())}</p>`);
            } else {
              _push(`<!---->`);
            }
            if (masterProfileOf(item)?.revoked_at) {
              _push(`<p>Bekor qilingan: ${ssrInterpolate(new Date(masterProfileOf(item)?.revoked_at || "").toLocaleString())}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="flex flex-wrap gap-2">`);
            _push(ssrRenderComponent(_component_UButton, {
              color: "success",
              variant: "soft",
              loading: unref(actionLoadingId) === item.id,
              disabled: masterStatusOf(item) === "approved",
              onClick: ($event) => updateMasterStatus(item, "approved")
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Approved `);
                } else {
                  return [
                    createTextVNode(" Approved ")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UButton, {
              color: "neutral",
              variant: "soft",
              loading: unref(actionLoadingId) === item.id,
              disabled: masterStatusOf(item) === "pending",
              onClick: ($event) => updateMasterStatus(item, "pending")
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Pending `);
                } else {
                  return [
                    createTextVNode(" Pending ")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UButton, {
              color: "error",
              variant: "soft",
              loading: unref(actionLoadingId) === item.id,
              disabled: masterStatusOf(item) === "revoked",
              onClick: ($event) => updateMasterStatus(item, "revoked")
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Revoked `);
                } else {
                  return [
                    createTextVNode(" Revoked ")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div></section>`);
          });
          _push(`<!--]--><!--]-->`);
        } else {
          _push(`<!--[-->`);
          if (!unref(loading) && unref(pendingItems).length === 0) {
            _push(`<section class="ff-panel rounded-3xl p-4"><p class="text-sm text-slate-600">Бекор қилиш кутилаётган сўровлар ҳозирча йўқ.</p></section>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(unref(pendingItems), (item) => {
            _push(`<section class="ff-panel rounded-3xl p-4 space-y-2"><p class="text-sm font-bold">${ssrInterpolate(item.service_requests?.public_code)}</p><p class="text-xs text-slate-600">Mijoz: ${ssrInterpolate(item.users?.display_name)}</p><p class="text-xs text-slate-600">Telefon: ${ssrInterpolate(item.users?.phone_e164 || item.service_requests?.phone_e164 || "-")}</p><p class="text-xs text-slate-600">Muammo: ${ssrInterpolate(item.service_requests?.problem_summary || "-")}</p><div class="flex gap-2 pt-1">`);
            _push(ssrRenderComponent(_component_UButton, {
              color: "error",
              variant: "soft",
              loading: unref(actionLoadingId) === item.id,
              onClick: ($event) => review(item.id, "approve")
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Бекор қилишни тасдиқлаш `);
                } else {
                  return [
                    createTextVNode(" Бекор қилишни тасдиқлаш ")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UButton, {
              color: "neutral",
              variant: "soft",
              loading: unref(actionLoadingId) === item.id,
              onClick: ($event) => review(item.id, "reject")
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Рад этиш `);
                } else {
                  return [
                    createTextVNode(" Рад этиш ")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div></section>`);
          });
          _push(`<!--]--><div class="pt-2"><h2 class="ff-section-title">Бекор қилиш сўровлари тарихи</h2></div>`);
          if (!unref(loading) && unref(historyItems).length === 0) {
            _push(`<section class="ff-panel rounded-3xl p-4"><p class="text-sm text-slate-600">Бекор қилиш тарихи ҳозирча йўқ.</p></section>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(unref(historyItems), (item) => {
            _push(`<section class="ff-panel rounded-3xl p-4 space-y-2"><div class="flex items-center justify-between gap-2"><p class="text-sm font-bold">${ssrInterpolate(item.service_requests?.public_code)}</p><span class="${ssrRenderClass([item.status === "approved" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700", "inline-flex rounded-full px-2 py-1 text-xs font-semibold"])}">${ssrInterpolate(item.status === "approved" ? "Бекор қилинган" : "Рад этилган")}</span></div><p class="text-xs text-slate-600">Mijoz: ${ssrInterpolate(item.users?.display_name || "-")}</p><p class="text-xs text-slate-600">Telefon: ${ssrInterpolate(item.users?.phone_e164 || item.service_requests?.phone_e164 || "-")}</p><p class="text-xs text-slate-600">Muammo: ${ssrInterpolate(item.service_requests?.problem_summary || "-")}</p><p class="text-xs text-slate-500"> So&#39;rov vaqti: ${ssrInterpolate(new Date(item.created_at).toLocaleString())}</p>`);
            if (item.reviewed_at) {
              _push(`<p class="text-xs text-slate-500"> Ko&#39;rib chiqilgan: ${ssrInterpolate(new Date(item.reviewed_at).toLocaleString())}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</section>`);
          });
          _push(`<!--]--><!--]-->`);
        }
        _push(`<!--]-->`);
      }
      if (unref(errorMessage)) {
        _push(ssrRenderComponent(_component_ErrorState, {
          title: "Xato",
          message: unref(errorMessage)
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</main>`);
      if (unref(loggedIn)) {
        _push(`<footer class="fixed inset-x-0 bottom-0 z-20 border-t border-white/70 bg-[#eef6f2]/95 px-4 py-3 shadow-[0_-10px_30px_rgba(28,75,61,0.12)] backdrop-blur"><div class="mx-auto grid max-w-md grid-cols-4 gap-2"><button type="button" class="${ssrRenderClass([unref(activeSection) === "dispatch" ? "bg-[#7358e8] text-white shadow-[0_8px_20px_rgba(115,88,232,0.28)]" : "bg-white/80 text-[#4f665d]", "flex min-h-14 items-center justify-center gap-1.5 rounded-2xl px-2 text-sm font-bold transition"])}">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-send",
          class: "size-4"
        }, null, _parent));
        _push(`<span>Актив</span><span class="${ssrRenderClass([unref(activeSection) === "dispatch" ? "bg-white/20" : "bg-[#e5eee9]", "rounded-full px-2 py-0.5 text-xs"])}">${ssrInterpolate(unref(pendingDispatchItems).length)}</span></button><button type="button" class="${ssrRenderClass([unref(activeSection) === "orders" ? "bg-[#7358e8] text-white shadow-[0_8px_20px_rgba(115,88,232,0.28)]" : "bg-white/80 text-[#4f665d]", "flex min-h-14 items-center justify-center gap-2 rounded-2xl px-2 text-sm font-bold transition"])}">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-clipboard-list",
          class: "size-4"
        }, null, _parent));
        _push(`<span>Ордер</span><span class="${ssrRenderClass([unref(activeSection) === "orders" ? "bg-white/20" : "bg-[#e5eee9]", "rounded-full px-2 py-0.5 text-xs"])}">${ssrInterpolate(unref(orderItems).length)}</span></button><button type="button" class="${ssrRenderClass([unref(activeSection) === "masters" ? "bg-[#7358e8] text-white shadow-[0_8px_20px_rgba(115,88,232,0.28)]" : "bg-white/80 text-[#4f665d]", "flex min-h-14 items-center justify-center gap-1.5 rounded-2xl px-2 text-sm font-bold transition"])}">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-user-check",
          class: "size-4"
        }, null, _parent));
        _push(`<span>Уста</span><span class="${ssrRenderClass([unref(activeSection) === "masters" ? "bg-white/20" : "bg-[#e5eee9]", "rounded-full px-2 py-0.5 text-xs"])}">${ssrInterpolate(unref(pendingMastersCount))}</span></button><button type="button" class="${ssrRenderClass([unref(activeSection) === "cancel" ? "bg-[#7358e8] text-white shadow-[0_8px_20px_rgba(115,88,232,0.28)]" : "bg-white/80 text-[#4f665d]", "flex min-h-14 items-center justify-center gap-1.5 rounded-2xl px-2 text-sm font-bold transition"])}">`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-ban",
          class: "size-4"
        }, null, _parent));
        _push(`<span>Бекор</span><span class="${ssrRenderClass([unref(activeSection) === "cancel" ? "bg-white/20" : "bg-[#e5eee9]", "rounded-full px-2 py-0.5 text-xs"])}">${ssrInterpolate(unref(pendingItems).length)}</span></button></div></footer>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };;globalThis.__timing__.logEnd('Load chunks/build/index-CioBJIxm');
//# sourceMappingURL=index-CioBJIxm.mjs.map
