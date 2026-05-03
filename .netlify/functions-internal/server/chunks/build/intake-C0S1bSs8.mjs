globalThis.__timing__.logStart('Load chunks/build/intake-C0S1bSs8');import { u as useAppI18n, _ as __nuxt_component_0, a as __nuxt_component_2, b as __nuxt_component_3 } from './ErrorState-iIpWDbpG.mjs';
import { _ as _sfc_main$1$1, a as _sfc_main$3 } from './Input-DMm2Wy-o.mjs';
import { j as useRoute, h as _sfc_main$e, b as _sfc_main$8, c as useVModel, d as useAppConfig, e as useComponentUI, f as useFormField, g as useComponentIcons, t as tv, P as Primitive, i as _sfc_main$b, n as navigateTo, l as looseToNumber } from './server.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, isRef, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, createTextVNode, useSlots, useTemplateRef, watch, nextTick, renderSlot, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrRenderSlot } from 'vue/server-renderer';
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
  __name: "AddressMapPicker",
  __ssrInlineRender: true,
  props: {
    label: {},
    locateLabel: { default: "Mening joylashuvim" },
    loading: { type: Boolean, default: false },
    initialLat: { default: null },
    initialLng: { default: null },
    initialAddress: { default: "" }
  },
  emits: ["change"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    ref(null);
    const addressText = ref(props.initialAddress || "");
    const lat = ref(props.initialLat ?? null);
    const lng = ref(props.initialLng ?? null);
    const ready = ref(false);
    const locating = ref(false);
    const locateError = ref("");
    watch(addressText, () => {
      if (lat.value === null || lng.value === null) return;
      const text = addressText.value.trim();
      if (!text) return;
      emit("change", {
        address_text: text,
        address_lat: lat.value,
        address_lng: lng.value
      });
    });
    const locateMe = () => {
      locateError.value = "";
      return;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UInput = _sfc_main$3;
      const _component_UButton = _sfc_main$8;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "ff-rise rounded-2xl border border-slate-200 bg-white p-3 shadow-sm" }, _attrs))}><p class="text-xs font-bold uppercase tracking-wide text-slate-500">${ssrInterpolate(props.label)}</p><div class="mt-2 h-44 w-full overflow-hidden rounded-xl border border-slate-200"></div>`);
      if (unref(ready) && unref(lat) !== null && unref(lng) !== null) {
        _push(`<div class="mt-2 text-xs text-slate-500">${ssrInterpolate(unref(lat))}, ${ssrInterpolate(unref(lng))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_UInput, {
        modelValue: unref(addressText),
        "onUpdate:modelValue": ($event) => isRef(addressText) ? addressText.value = $event : null,
        class: "mt-2 w-full",
        placeholder: props.label
      }, null, _parent));
      if (unref(addressText)) {
        _push(`<p class="mt-2 break-words text-xs leading-5 text-slate-600">${ssrInterpolate(unref(addressText))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="mt-2 flex flex-wrap gap-2">`);
      _push(ssrRenderComponent(_component_UButton, {
        color: "neutral",
        variant: "soft",
        loading: unref(locating),
        disabled: props.loading || !unref(ready),
        onClick: locateMe
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(props.locateLabel)}`);
          } else {
            return [
              createTextVNode(toDisplayString(props.locateLabel), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(locateError)) {
        _push(`<p class="mt-2 text-xs font-medium text-rose-600">${ssrInterpolate(unref(locateError))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AddressMapPicker.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_6 = Object.assign(_sfc_main$2, { __name: "AddressMapPicker" });
const theme = {
  "slots": {
    "root": "relative inline-flex items-center",
    "base": [
      "w-full rounded-md border-0 appearance-none placeholder:text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75",
      "transition-colors"
    ],
    "leading": "absolute start-0 flex items-start",
    "leadingIcon": "shrink-0 text-dimmed",
    "leadingAvatar": "shrink-0",
    "leadingAvatarSize": "",
    "trailing": "absolute end-0 flex items-start",
    "trailingIcon": "shrink-0 text-dimmed"
  },
  "variants": {
    "fieldGroup": {
      "horizontal": {
        "root": "group has-focus-visible:z-[1]",
        "base": "group-not-only:group-first:rounded-e-none group-not-only:group-last:rounded-s-none group-not-last:group-not-first:rounded-none"
      },
      "vertical": {
        "root": "group has-focus-visible:z-[1]",
        "base": "group-not-only:group-first:rounded-b-none group-not-only:group-last:rounded-t-none group-not-last:group-not-first:rounded-none"
      }
    },
    "size": {
      "xs": {
        "base": "px-2 py-1 text-sm/4 gap-1",
        "leading": "ps-2 inset-y-1",
        "trailing": "pe-2 inset-y-1",
        "leadingIcon": "size-4",
        "leadingAvatarSize": "3xs",
        "trailingIcon": "size-4"
      },
      "sm": {
        "base": "px-2.5 py-1.5 text-sm/4 gap-1.5",
        "leading": "ps-2.5 inset-y-1.5",
        "trailing": "pe-2.5 inset-y-1.5",
        "leadingIcon": "size-4",
        "leadingAvatarSize": "3xs",
        "trailingIcon": "size-4"
      },
      "md": {
        "base": "px-2.5 py-1.5 text-base/5 gap-1.5",
        "leading": "ps-2.5 inset-y-1.5",
        "trailing": "pe-2.5 inset-y-1.5",
        "leadingIcon": "size-5",
        "leadingAvatarSize": "2xs",
        "trailingIcon": "size-5"
      },
      "lg": {
        "base": "px-3 py-2 text-base/5 gap-2",
        "leading": "ps-3 inset-y-2",
        "trailing": "pe-3 inset-y-2",
        "leadingIcon": "size-5",
        "leadingAvatarSize": "2xs",
        "trailingIcon": "size-5"
      },
      "xl": {
        "base": "px-3 py-2 text-base gap-2",
        "leading": "ps-3 inset-y-2",
        "trailing": "pe-3 inset-y-2",
        "leadingIcon": "size-6",
        "leadingAvatarSize": "xs",
        "trailingIcon": "size-6"
      }
    },
    "variant": {
      "outline": "text-highlighted bg-default ring ring-inset ring-accented",
      "soft": "text-highlighted bg-elevated/50 hover:bg-elevated focus:bg-elevated disabled:bg-elevated/50",
      "subtle": "text-highlighted bg-elevated ring ring-inset ring-accented",
      "ghost": "text-highlighted bg-transparent hover:bg-elevated focus:bg-elevated disabled:bg-transparent dark:disabled:bg-transparent",
      "none": "text-highlighted bg-transparent"
    },
    "color": {
      "primary": "",
      "secondary": "",
      "success": "",
      "info": "",
      "warning": "",
      "error": "",
      "neutral": ""
    },
    "leading": {
      "true": ""
    },
    "trailing": {
      "true": ""
    },
    "loading": {
      "true": ""
    },
    "highlight": {
      "true": ""
    },
    "fixed": {
      "false": ""
    },
    "type": {
      "file": "file:me-1.5 file:font-medium file:text-muted file:outline-none"
    },
    "autoresize": {
      "true": {
        "base": "resize-none"
      }
    }
  },
  "compoundVariants": [
    {
      "color": "primary",
      "variant": [
        "outline",
        "subtle"
      ],
      "class": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
    },
    {
      "color": "secondary",
      "variant": [
        "outline",
        "subtle"
      ],
      "class": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
    },
    {
      "color": "success",
      "variant": [
        "outline",
        "subtle"
      ],
      "class": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-success"
    },
    {
      "color": "info",
      "variant": [
        "outline",
        "subtle"
      ],
      "class": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-info"
    },
    {
      "color": "warning",
      "variant": [
        "outline",
        "subtle"
      ],
      "class": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-warning"
    },
    {
      "color": "error",
      "variant": [
        "outline",
        "subtle"
      ],
      "class": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-error"
    },
    {
      "color": "primary",
      "highlight": true,
      "class": "ring ring-inset ring-primary"
    },
    {
      "color": "secondary",
      "highlight": true,
      "class": "ring ring-inset ring-secondary"
    },
    {
      "color": "success",
      "highlight": true,
      "class": "ring ring-inset ring-success"
    },
    {
      "color": "info",
      "highlight": true,
      "class": "ring ring-inset ring-info"
    },
    {
      "color": "warning",
      "highlight": true,
      "class": "ring ring-inset ring-warning"
    },
    {
      "color": "error",
      "highlight": true,
      "class": "ring ring-inset ring-error"
    },
    {
      "color": "neutral",
      "variant": [
        "outline",
        "subtle"
      ],
      "class": "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-inverted"
    },
    {
      "color": "neutral",
      "highlight": true,
      "class": "ring ring-inset ring-inverted"
    },
    {
      "leading": true,
      "size": "xs",
      "class": "ps-7"
    },
    {
      "leading": true,
      "size": "sm",
      "class": "ps-8"
    },
    {
      "leading": true,
      "size": "md",
      "class": "ps-9"
    },
    {
      "leading": true,
      "size": "lg",
      "class": "ps-10"
    },
    {
      "leading": true,
      "size": "xl",
      "class": "ps-11"
    },
    {
      "trailing": true,
      "size": "xs",
      "class": "pe-7"
    },
    {
      "trailing": true,
      "size": "sm",
      "class": "pe-8"
    },
    {
      "trailing": true,
      "size": "md",
      "class": "pe-9"
    },
    {
      "trailing": true,
      "size": "lg",
      "class": "pe-10"
    },
    {
      "trailing": true,
      "size": "xl",
      "class": "pe-11"
    },
    {
      "loading": true,
      "leading": true,
      "class": {
        "leadingIcon": "animate-spin"
      }
    },
    {
      "loading": true,
      "leading": false,
      "trailing": true,
      "class": {
        "trailingIcon": "animate-spin"
      }
    },
    {
      "fixed": false,
      "size": "xs",
      "class": "md:text-xs"
    },
    {
      "fixed": false,
      "size": "sm",
      "class": "md:text-xs"
    },
    {
      "fixed": false,
      "size": "md",
      "class": "md:text-sm"
    },
    {
      "fixed": false,
      "size": "lg",
      "class": "md:text-sm"
    }
  ],
  "defaultVariants": {
    "size": "md",
    "color": "primary",
    "variant": "outline"
  }
};
const _sfc_main$1 = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "UTextarea",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    id: { type: String, required: false },
    name: { type: String, required: false },
    placeholder: { type: String, required: false },
    color: { type: null, required: false },
    variant: { type: null, required: false },
    size: { type: null, required: false },
    required: { type: Boolean, required: false },
    autofocus: { type: Boolean, required: false },
    autofocusDelay: { type: Number, required: false, default: 0 },
    autoresize: { type: Boolean, required: false },
    autoresizeDelay: { type: Number, required: false, default: 0 },
    disabled: { type: Boolean, required: false },
    rows: { type: Number, required: false, default: 3 },
    maxrows: { type: Number, required: false, default: 0 },
    highlight: { type: Boolean, required: false },
    fixed: { type: Boolean, required: false },
    defaultValue: { type: null, required: false },
    modelValue: { type: null, required: false },
    modelModifiers: { type: null, required: false },
    class: { type: null, required: false },
    ui: { type: Object, required: false },
    icon: { type: null, required: false },
    avatar: { type: Object, required: false },
    leading: { type: Boolean, required: false },
    leadingIcon: { type: null, required: false },
    trailing: { type: Boolean, required: false },
    trailingIcon: { type: null, required: false },
    loading: { type: Boolean, required: false },
    loadingIcon: { type: null, required: false }
  },
  emits: ["update:modelValue", "blur", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const modelValue = useVModel(props, "modelValue", emits, { defaultValue: props.defaultValue });
    const appConfig = useAppConfig();
    const uiProp = useComponentUI("textarea", props);
    const { emitFormFocus, emitFormBlur, emitFormInput, emitFormChange, size, color, id, name, highlight, disabled, ariaAttrs } = useFormField(props, { deferInputValidation: true });
    const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(props);
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.textarea || {} })({
      color: color.value,
      variant: props.variant,
      size: size?.value,
      loading: props.loading,
      highlight: highlight.value,
      fixed: props.fixed,
      autoresize: props.autoresize,
      leading: isLeading.value || !!props.avatar || !!slots.leading,
      trailing: isTrailing.value || !!slots.trailing
    }));
    const textareaRef = useTemplateRef("textareaRef");
    function updateInput(value) {
      if (props.modelModifiers?.trim && (typeof value === "string" || value === null || value === void 0)) {
        value = value?.trim() ?? null;
      }
      if (props.modelModifiers?.number) {
        value = looseToNumber(value);
      }
      if (props.modelModifiers?.nullable) {
        value ||= null;
      }
      if (props.modelModifiers?.optional && !props.modelModifiers?.nullable && value !== null) {
        value ||= void 0;
      }
      modelValue.value = value;
      emitFormInput();
    }
    function onInput(event) {
      autoResize();
      if (!props.modelModifiers?.lazy) {
        updateInput(event.target.value);
      }
    }
    function onChange(event) {
      const value = event.target.value;
      if (props.modelModifiers?.lazy) {
        updateInput(value);
      }
      if (props.modelModifiers?.trim) {
        event.target.value = value.trim();
      }
      emitFormChange();
      emits("change", event);
    }
    function onBlur(event) {
      emitFormBlur();
      emits("blur", event);
    }
    function autoResize() {
      if (props.autoresize && textareaRef.value) {
        textareaRef.value.rows = props.rows;
        const overflow = textareaRef.value.style.overflow;
        textareaRef.value.style.overflow = "hidden";
        const styles = (void 0).getComputedStyle(textareaRef.value);
        const paddingTop = Number.parseInt(styles.paddingTop);
        const paddingBottom = Number.parseInt(styles.paddingBottom);
        const padding = paddingTop + paddingBottom;
        const lineHeight = Number.parseInt(styles.lineHeight);
        const { scrollHeight } = textareaRef.value;
        const newRows = (scrollHeight - padding) / lineHeight;
        if (newRows > props.rows) {
          textareaRef.value.rows = props.maxrows ? Math.min(newRows, props.maxrows) : newRows;
        }
        textareaRef.value.style.overflow = overflow;
      }
    }
    watch(modelValue, () => {
      nextTick(autoResize);
    });
    __expose({
      textareaRef
    });
    return (_ctx, _push, _parent, _attrs) => {
      let _temp0;
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        "data-slot": "root",
        class: ui.value.root({ class: [unref(uiProp)?.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<textarea${ssrRenderAttrs(_temp0 = mergeProps({
              id: unref(id),
              ref_key: "textareaRef",
              ref: textareaRef,
              value: unref(modelValue),
              name: unref(name),
              rows: __props.rows,
              placeholder: __props.placeholder,
              "data-slot": "base",
              class: ui.value.base({ class: unref(uiProp)?.base }),
              disabled: unref(disabled),
              required: __props.required
            }, { ..._ctx.$attrs, ...unref(ariaAttrs) }), "textarea")}${_scopeId}>${ssrInterpolate("value" in _temp0 ? _temp0.value : "")}</textarea>`);
            ssrRenderSlot(_ctx.$slots, "default", { ui: ui.value }, null, _push2, _parent2, _scopeId);
            if (unref(isLeading) || !!__props.avatar || !!slots.leading) {
              _push2(`<span data-slot="leading" class="${ssrRenderClass(ui.value.leading({ class: unref(uiProp)?.leading }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "leading", { ui: ui.value }, () => {
                if (unref(isLeading) && unref(leadingIconName)) {
                  _push2(ssrRenderComponent(_sfc_main$e, {
                    name: unref(leadingIconName),
                    "data-slot": "leadingIcon",
                    class: ui.value.leadingIcon({ class: unref(uiProp)?.leadingIcon })
                  }, null, _parent2, _scopeId));
                } else if (!!__props.avatar) {
                  _push2(ssrRenderComponent(_sfc_main$b, mergeProps({
                    size: unref(uiProp)?.leadingAvatarSize || ui.value.leadingAvatarSize()
                  }, __props.avatar, {
                    "data-slot": "leadingAvatar",
                    class: ui.value.leadingAvatar({ class: unref(uiProp)?.leadingAvatar })
                  }), null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
              }, _push2, _parent2, _scopeId);
              _push2(`</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(isTrailing) || !!slots.trailing) {
              _push2(`<span data-slot="trailing" class="${ssrRenderClass(ui.value.trailing({ class: unref(uiProp)?.trailing }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "trailing", { ui: ui.value }, () => {
                if (unref(trailingIconName)) {
                  _push2(ssrRenderComponent(_sfc_main$e, {
                    name: unref(trailingIconName),
                    "data-slot": "trailingIcon",
                    class: ui.value.trailingIcon({ class: unref(uiProp)?.trailingIcon })
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
              }, _push2, _parent2, _scopeId);
              _push2(`</span>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("textarea", mergeProps({
                id: unref(id),
                ref_key: "textareaRef",
                ref: textareaRef,
                value: unref(modelValue),
                name: unref(name),
                rows: __props.rows,
                placeholder: __props.placeholder,
                "data-slot": "base",
                class: ui.value.base({ class: unref(uiProp)?.base }),
                disabled: unref(disabled),
                required: __props.required
              }, { ..._ctx.$attrs, ...unref(ariaAttrs) }, {
                onInput,
                onBlur,
                onChange,
                onFocus: unref(emitFormFocus)
              }), null, 16, ["id", "value", "name", "rows", "placeholder", "disabled", "required", "onFocus"]),
              renderSlot(_ctx.$slots, "default", { ui: ui.value }),
              unref(isLeading) || !!__props.avatar || !!slots.leading ? (openBlock(), createBlock("span", {
                key: 0,
                "data-slot": "leading",
                class: ui.value.leading({ class: unref(uiProp)?.leading })
              }, [
                renderSlot(_ctx.$slots, "leading", { ui: ui.value }, () => [
                  unref(isLeading) && unref(leadingIconName) ? (openBlock(), createBlock(_sfc_main$e, {
                    key: 0,
                    name: unref(leadingIconName),
                    "data-slot": "leadingIcon",
                    class: ui.value.leadingIcon({ class: unref(uiProp)?.leadingIcon })
                  }, null, 8, ["name", "class"])) : !!__props.avatar ? (openBlock(), createBlock(_sfc_main$b, mergeProps({
                    key: 1,
                    size: unref(uiProp)?.leadingAvatarSize || ui.value.leadingAvatarSize()
                  }, __props.avatar, {
                    "data-slot": "leadingAvatar",
                    class: ui.value.leadingAvatar({ class: unref(uiProp)?.leadingAvatar })
                  }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                ])
              ], 2)) : createCommentVNode("", true),
              unref(isTrailing) || !!slots.trailing ? (openBlock(), createBlock("span", {
                key: 1,
                "data-slot": "trailing",
                class: ui.value.trailing({ class: unref(uiProp)?.trailing })
              }, [
                renderSlot(_ctx.$slots, "trailing", { ui: ui.value }, () => [
                  unref(trailingIconName) ? (openBlock(), createBlock(_sfc_main$e, {
                    key: 0,
                    name: unref(trailingIconName),
                    "data-slot": "trailingIcon",
                    class: ui.value.trailingIcon({ class: unref(uiProp)?.trailingIcon })
                  }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                ])
              ], 2)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/.pnpm/@nuxt+ui@4.6.1_@tiptap+extensions@3.22.4_@tiptap+core@3.22.4_@tiptap+pm@3.22.4__@tiptap_420fbbf327fd83ee5f829faee21c4e2f/node_modules/@nuxt/ui/dist/runtime/components/Textarea.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "intake",
  __ssrInlineRender: true,
  setup(__props) {
    const api = useRequesterApi();
    const route = useRoute();
    const { t, locale } = useAppI18n();
    const loading = ref(true);
    const submittingStructured = ref(false);
    const errorMessage = ref("");
    const request = ref(null);
    const domainName = ref("");
    const requesterName = ref("");
    const draftAddress = ref(null);
    const phoneInput = ref("");
    const visitTimeInput = ref("");
    const problemSummaryInput = ref("");
    const requestId = computed(() => String(route.params.requestId || ""));
    const intakeWritableStatuses = ["draft", "intake_in_progress", "ready_for_dispatch"];
    const intakeWritableStatusSet = new Set(intakeWritableStatuses);
    const canFillForm = computed(() => {
      if (!request.value) return false;
      return intakeWritableStatusSet.has(request.value.status);
    });
    const greetingText = computed(() => {
      const name = requesterName.value ? `, ${requesterName.value}` : "";
      if (locale.value === "ru") return `Здравствуйте${name}. Пожалуйста, введите описание проблемы и данные.`;
      return `Салом${name}. Илтимос, муаммо тавсилоти ва маълумотларни киритинг.`;
    });
    const UZ_PHONE_REGEX = /^\+998 \d{2} \d{3} \d{2} \d{2}$/;
    const phoneFormatError = computed(() => {
      if (!phoneInput.value.trim()) return "";
      if (UZ_PHONE_REGEX.test(phoneInput.value.trim())) return "";
      return "Телефон рақами +998 XX XXX XX XX форматда бўлиши керак.";
    });
    const normalizeUzPhone = (value) => {
      const digits = value.replace(/\D/g, "");
      if (!digits.startsWith("998")) return "";
      return `+${digits}`;
    };
    const formatUzPhoneInput = (value) => {
      const digits = value.replace(/\D/g, "");
      const local = digits.startsWith("998") ? digits.slice(3) : digits;
      const limited = local.slice(0, 9);
      const parts = [
        limited.slice(0, 2),
        limited.slice(2, 5),
        limited.slice(5, 7),
        limited.slice(7, 9)
      ].filter(Boolean);
      return `+998${parts.length ? ` ${parts.join(" ")}` : ""}`;
    };
    const onPhoneInput = (value) => {
      phoneInput.value = formatUzPhoneInput(String(value ?? ""));
    };
    const minVisitDateTime = computed(() => {
      const now = /* @__PURE__ */ new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const local = new Date(startOfToday.getTime() - startOfToday.getTimezoneOffset() * 6e4);
      return local.toISOString().slice(0, 16);
    });
    const visitTimeError = computed(() => {
      if (!visitTimeInput.value.trim()) return "";
      const selected = new Date(visitTimeInput.value);
      if (Number.isNaN(selected.getTime())) return "";
      const now = /* @__PURE__ */ new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (selected < startOfToday) {
        return locale.value === "ru" ? "Нельзя выбрать дату раньше сегодняшнего дня." : "Бугундан олдинги санани танлаб бўлмайди.";
      }
      return "";
    });
    const submitDisabled = computed(() => {
      if (!request.value || !canFillForm.value) return true;
      if (!phoneInput.value.trim() || !visitTimeInput.value.trim() || !problemSummaryInput.value.trim()) return true;
      if (!!phoneFormatError.value) return true;
      if (!!visitTimeError.value) return true;
      const hasSavedAddress = !!request.value.address_text && request.value.address_lat !== null && request.value.address_lng !== null;
      const hasDraftAddress = !!draftAddress.value?.address_text;
      if (!hasSavedAddress && !hasDraftAddress) return true;
      return submittingStructured.value;
    });
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
    const loadDomain = async (domainId) => {
      try {
        const domains = await api.getServiceDomains();
        const selected = domains.data.find((item) => item.id === domainId);
        domainName.value = selected ? locale.value === "ru" ? selected.name_ru : selected.name_uz_cyrl : `#${domainId}`;
      } catch {
        domainName.value = `#${domainId}`;
      }
    };
    const loadRequesterName = async () => {
      try {
        const bootstrap = await api.bootstrap();
        requesterName.value = bootstrap.data.user.display_name?.trim() || "";
      } catch {
        requesterName.value = "";
      }
    };
    const syncFromRequest = (value) => {
      request.value = value;
      if (value.phone_e164 && !phoneInput.value) phoneInput.value = formatUzPhoneInput(value.phone_e164);
      if (value.visit_time_at && !visitTimeInput.value) {
        const dt = new Date(value.visit_time_at);
        const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
        visitTimeInput.value = local;
      }
      if (value.problem_summary && !problemSummaryInput.value) problemSummaryInput.value = value.problem_summary;
    };
    const loadRequest = async () => {
      loading.value = true;
      errorMessage.value = "";
      try {
        const result = await api.getRequest(requestId.value);
        syncFromRequest(result.data);
        await Promise.all([loadDomain(result.data.domain_id), loadRequesterName()]);
      } catch (error) {
        errorMessage.value = error?.data?.error?.message || t("common.unexpectedError");
      } finally {
        loading.value = false;
      }
    };
    const setDraftAddress = (payload) => {
      draftAddress.value = payload;
    };
    const submitStructuredForm = async () => {
      if (!request.value || submitDisabled.value) return;
      submittingStructured.value = true;
      errorMessage.value = "";
      try {
        if ((!request.value.address_text || request.value.address_lat === null || request.value.address_lng === null) && draftAddress.value) {
          const saved = await api.setAddressFromMap(request.value.id, draftAddress.value);
          syncFromRequest(saved.data.request);
        }
        if (!request.value.address_text || request.value.address_lat === null || request.value.address_lng === null) {
          errorMessage.value = t("requester.formAddressRequired");
          return;
        }
        const result = await api.submitStructuredIntake(request.value.id, {
          phone: normalizeUzPhone(phoneInput.value.trim()),
          visit_time_at: new Date(visitTimeInput.value).toISOString(),
          problem_summary: problemSummaryInput.value.trim(),
          address_text: request.value.address_text,
          address_lat: request.value.address_lat,
          address_lng: request.value.address_lng
        });
        syncFromRequest(result.data.request);
        await navigateTo(`/requester/requests/${request.value.id}/status`);
      } catch (error) {
        errorMessage.value = error?.data?.error?.message || t("common.unexpectedError");
      } finally {
        submittingStructured.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = __nuxt_component_0;
      const _component_LoadingState = __nuxt_component_2;
      const _component_ErrorState = __nuxt_component_3;
      const _component_UFormField = _sfc_main$1$1;
      const _component_UInput = _sfc_main$3;
      const _component_UIcon = _sfc_main$e;
      const _component_AddressMapPicker = __nuxt_component_6;
      const _component_UTextarea = _sfc_main$1;
      const _component_UButton = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "ff-shell flex min-h-dvh flex-col" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AppHeader, {
        title: unref(t)("requester.chatTitle"),
        subtitle: unref(t)("requester.chatHint"),
        "logo-text": "FF",
        "show-back-button": true,
        "back-to": "/requester"
      }, null, _parent));
      _push(`<main class="flex-1 space-y-4 px-4 py-4">`);
      if (unref(loading)) {
        _push(ssrRenderComponent(_component_LoadingState, {
          label: unref(t)("requester.loadingRequest")
        }, null, _parent));
      } else if (!unref(request) && unref(errorMessage)) {
        _push(ssrRenderComponent(_component_ErrorState, {
          title: unref(t)("common.unexpectedError"),
          message: unref(errorMessage),
          "retry-label": unref(t)("common.retry"),
          onRetry: loadRequest
        }, null, _parent));
      } else if (unref(request)) {
        _push(`<!--[--><section class="ff-rise rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div class="flex items-start justify-between gap-3"><div class="min-w-0"><p class="text-xs font-semibold uppercase tracking-wide text-slate-500">${ssrInterpolate(unref(t)("requester.domainLabel"))}</p><p class="mt-1"><span class="inline-flex max-w-full items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700"><span class="truncate">${ssrInterpolate(unref(domainName))}</span></span></p></div>`);
        if (unref(request).status !== "draft") {
          _push(`<span class="${ssrRenderClass([statusToneClass(unref(request).status), "ff-status-chip shrink-0"])}">${ssrInterpolate(statusLabel(unref(request).status))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></section><section class="ff-rise rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p class="text-sm font-bold text-slate-800">${ssrInterpolate(unref(greetingText))}</p></section><section class="ff-rise rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"><p class="text-xs font-bold uppercase tracking-wide text-violet-700">${ssrInterpolate(unref(t)("requester.readyToDispatch"))}</p><div class="mt-3 space-y-3">`);
        _push(ssrRenderComponent(_component_UFormField, {
          label: unref(t)("requester.formPhone"),
          required: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(phoneInput),
                "onUpdate:modelValue": [($event) => isRef(phoneInput) ? phoneInput.value = $event : null, onPhoneInput],
                placeholder: "+998 90 123 45 67",
                disabled: !unref(canFillForm),
                size: "xl",
                variant: "outline",
                class: "w-full"
              }, null, _parent2, _scopeId));
              if (unref(phoneFormatError)) {
                _push2(`<p class="mt-1 text-xs font-medium text-rose-600"${_scopeId}>${ssrInterpolate(unref(phoneFormatError))}</p>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(phoneInput),
                  "onUpdate:modelValue": [($event) => isRef(phoneInput) ? phoneInput.value = $event : null, onPhoneInput],
                  placeholder: "+998 90 123 45 67",
                  disabled: !unref(canFillForm),
                  size: "xl",
                  variant: "outline",
                  class: "w-full"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "disabled"]),
                unref(phoneFormatError) ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "mt-1 text-xs font-medium text-rose-600"
                }, toDisplayString(unref(phoneFormatError)), 1)) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UFormField, { required: "" }, {
          label: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="inline-flex items-center gap-1.5"${_scopeId}><span${_scopeId}>${ssrInterpolate(unref(t)("requester.formVisitTime"))}</span><span class="group relative inline-flex"${_scopeId}><button type="button" class="inline-flex size-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-[#5c4bd6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7358e8]"${ssrRenderAttr("aria-label", unref(t)("requester.formVisitTimeHint"))}${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-info",
                class: "size-4"
              }, null, _parent2, _scopeId));
              _push2(`</button><span class="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 rounded-xl bg-[#2b2853] px-3 py-2 text-center text-xs font-medium leading-4 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" role="tooltip"${_scopeId}>${ssrInterpolate(unref(t)("requester.formVisitTimeHint"))}</span></span></span>`);
            } else {
              return [
                createVNode("span", { class: "inline-flex items-center gap-1.5" }, [
                  createVNode("span", null, toDisplayString(unref(t)("requester.formVisitTime")), 1),
                  createVNode("span", { class: "group relative inline-flex" }, [
                    createVNode("button", {
                      type: "button",
                      class: "inline-flex size-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-[#5c4bd6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7358e8]",
                      "aria-label": unref(t)("requester.formVisitTimeHint")
                    }, [
                      createVNode(_component_UIcon, {
                        name: "i-lucide-info",
                        class: "size-4"
                      })
                    ], 8, ["aria-label"]),
                    createVNode("span", {
                      class: "pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 rounded-xl bg-[#2b2853] px-3 py-2 text-center text-xs font-medium leading-4 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
                      role: "tooltip"
                    }, toDisplayString(unref(t)("requester.formVisitTimeHint")), 1)
                  ])
                ])
              ];
            }
          }),
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UInput, {
                modelValue: unref(visitTimeInput),
                "onUpdate:modelValue": ($event) => isRef(visitTimeInput) ? visitTimeInput.value = $event : null,
                type: "datetime-local",
                min: unref(minVisitDateTime),
                disabled: !unref(canFillForm),
                size: "xl",
                variant: "outline",
                class: "w-full"
              }, null, _parent2, _scopeId));
              if (unref(visitTimeError)) {
                _push2(`<p class="mt-1 text-xs font-medium text-rose-600"${_scopeId}>${ssrInterpolate(unref(visitTimeError))}</p>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode(_component_UInput, {
                  modelValue: unref(visitTimeInput),
                  "onUpdate:modelValue": ($event) => isRef(visitTimeInput) ? visitTimeInput.value = $event : null,
                  type: "datetime-local",
                  min: unref(minVisitDateTime),
                  disabled: !unref(canFillForm),
                  size: "xl",
                  variant: "outline",
                  class: "w-full"
                }, null, 8, ["modelValue", "onUpdate:modelValue", "min", "disabled"]),
                unref(visitTimeError) ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "mt-1 text-xs font-medium text-rose-600"
                }, toDisplayString(unref(visitTimeError)), 1)) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_AddressMapPicker, {
          label: unref(t)("requester.mapAddressTitle"),
          "locate-label": unref(t)("requester.mapLocateMe"),
          "initial-lat": unref(request).address_lat,
          "initial-lng": unref(request).address_lng,
          "initial-address": unref(request).address_text,
          onChange: setDraftAddress
        }, null, _parent));
        _push(ssrRenderComponent(_component_UFormField, {
          label: unref(t)("requester.formProblem"),
          required: ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UTextarea, {
                modelValue: unref(problemSummaryInput),
                "onUpdate:modelValue": ($event) => isRef(problemSummaryInput) ? problemSummaryInput.value = $event : null,
                rows: 4,
                placeholder: unref(t)("requester.formProblem"),
                disabled: !unref(canFillForm),
                size: "xl",
                variant: "outline",
                class: "w-full",
                autoresize: ""
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UTextarea, {
                  modelValue: unref(problemSummaryInput),
                  "onUpdate:modelValue": ($event) => isRef(problemSummaryInput) ? problemSummaryInput.value = $event : null,
                  rows: 4,
                  placeholder: unref(t)("requester.formProblem"),
                  disabled: !unref(canFillForm),
                  size: "xl",
                  variant: "outline",
                  class: "w-full",
                  autoresize: ""
                }, null, 8, ["modelValue", "onUpdate:modelValue", "placeholder", "disabled"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="mt-4 flex flex-wrap gap-2">`);
        _push(ssrRenderComponent(_component_UButton, {
          loading: unref(submittingStructured),
          disabled: unref(submitDisabled),
          color: "primary",
          class: "font-semibold",
          onClick: submitStructuredForm
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(t)("requester.formSubmit"))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(t)("requester.formSubmit")), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></section>`);
        if (unref(errorMessage)) {
          _push(ssrRenderComponent(_component_ErrorState, {
            title: unref(t)("common.unexpectedError"),
            message: unref(errorMessage),
            "retry-label": unref(t)("common.retry"),
            onRetry: loadRequest
          }, null, _parent));
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/requester/requests/[requestId]/intake.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };;globalThis.__timing__.logEnd('Load chunks/build/intake-C0S1bSs8');
//# sourceMappingURL=intake-C0S1bSs8.mjs.map
