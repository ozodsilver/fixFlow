globalThis.__timing__.logStart('Load chunks/build/ErrorState-iIpWDbpG');import { v as useState, w as useRouter, h as _sfc_main$e, b as _sfc_main$8 } from './server.mjs';
import { defineComponent, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderComponent, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { D as publicAssetsURL } from '../nitro/nitro.mjs';

const _imports_0 = publicAssetsURL("/fixFlow.png");
const uzCyrl = {
  common: {
    appName: "HGS",
    loading: "Юкланмоқда...",
    retry: "Қайта уриниш",
    refresh: "Янгилаш",
    noData: "Маълумот топилмади",
    unexpectedError: "Кутилмаган хато юз берди",
    send: "Юбориш",
    cancel: "Бекор қилиш",
    confirm: "Тасдиқлаш",
    back: "Ортга",
    status: "Ҳолат",
    open: "Очиш"
  },
  locale: {
    uz_cyrl: "Ўзбекча",
    ru: "Русча"
  },
  auth: {
    title: "Локал кириш (dev)",
    subtitle: "Telegram initData ҳали уланмаган бўлса, тест user билан киринг",
    telegramId: "Telegram ID",
    displayName: "Исм",
    submit: "Кириш"
  },
  requester: {
    homeTitle: "Хизмат турини танланг",
    homeSubtitle: "Муаммоингизни тез ва аниқ юбориш учун хизмат турини танланг",
    myRequestsTitle: "Менинг мурожаатларим",
    noRequestsTitle: "Мурожаатлар ҳали йўқ",
    noRequestsDescription: "Янги мурожаат яратиш учун юқоридаги хизмат турини танланг.",
    openChat: "Мурожаатни бошлаш",
    noDomains: "Хизмат турлари ҳозирча мавжуд эмас",
    chatTitle: "Мурожаат яратиш",
    chatHint: "Бу ерда мурожаат учун керакли маълумотларни босқичма-босқич киритасиз",
    chatNoMessages: "Муаммони ёзинг, сиздан керакли маълумотлар навбат билан сўралади.",
    statusTitle: "Мурожаат ҳолати",
    summaryTitle: "Қисқача маълумот",
    summaryId: "Код",
    summaryStatus: "Ҳолат",
    summaryProblem: "Муаммо",
    summaryAddress: "Манзил",
    missingTitle: "Етишмаётган маълумотлар",
    readyToDispatch: "Мурожаат юборишга тайёр",
    confirmIntake: "Тасдиқлаш",
    confirmedIntake: "Мурожаат тайёр деб тасдиқланди.",
    dispatch: "Усталарга юбориш",
    dispatched: "Мурожаат усталар гуруҳига юборилди.",
    dataSentToMasters: "Маълумотларингиз мастерларга юборилди.",
    dispatchUntil: "Жорий диспетч тугаш вақти",
    goStatus: "Ҳолат саҳифасига ўтиш",
    continueIntake: "Чатга қайтиш",
    cancelRequest: "Мурожаатни бекор қилиш",
    cancelBlocked: "Бу босқичда мурожаатни фақат админ бекор қила олади.",
    cancelSentToAdmin: "Бекор қилиш сўрови админга юборилди. Админ кўриб чиққандан кейин ҳолат янгиланади.",
    domainLabel: "Танланган хизмат",
    loadingRequest: "Мурожаат юкланмоқда...",
    composerDisabled: "Бу ҳолатда чат ёпиқ.",
    mapAddressTitle: "Манзилни харитадан танланг",
    mapAddressSave: "Манзилни сақлаш",
    mapLocateMe: "Мен турган жой",
    formPhone: "Телефон рақами",
    formVisitTime: "Ташриф вақти (сана ва соат)",
    formVisitTimeHint: "Сизнинг мурожаатингиз бўйича мастернинг уйингизга бориш вақти",
    formProblem: "Муаммо тавсифи",
    formSubmit: "Мастерга юбориш",
    formAddressRequired: "Аввал харитадан манзилни сақланг.",
    offtopicRefusal: "Саволингизга қисқа жавоб бериб, мурожаатни давом эттираман.",
    composerPlaceholder: "Муаммо ҳақида ёзинг...",
    statusDraft: "Қоралама",
    statusIntakeInProgress: "Маълумот киритилмоқда",
    statusReadyForDispatch: "Мурожаат яратилди",
    statusDispatched: "Юборилди",
    statusInFulfillment: "Уста ишни олган",
    statusClosedCompleted: "Якунланди",
    statusClosedCanceledUser: "Мижоз бекор қилди",
    statusClosedCanceledAdmin: "Админ бекор қилди",
    statusClosedUnfulfilled: "Якунланмади"
  },
  fields: {
    service_domain: "Хизмат тури",
    issue_type: "Муаммо тури",
    problem_summary: "Муаммо қисқача тавсифи",
    phone: "Телефон рақами",
    address: "Манзил",
    landmark: "Мўлжал",
    urgency: "Шошилинчлик даражаси",
    visit_time: "Қачон келиши керак",
    consent: "Маълумотни устага бериш розилиги"
  }
};
const ru = {
  common: {
    appName: "HGS",
    loading: "Загрузка...",
    retry: "Повторить",
    refresh: "Обновить",
    noData: "Данные не найдены",
    unexpectedError: "Произошла непредвиденная ошибка",
    send: "Отправить",
    cancel: "Отмена",
    confirm: "Подтвердить",
    back: "Назад",
    status: "Статус",
    open: "Открыть"
  },
  locale: {
    uz_cyrl: "Узбекский",
    ru: "Русский"
  },
  auth: {
    title: "Локальный вход (dev)",
    subtitle: "Если Telegram initData еще не подключен, войдите тестовым пользователем",
    telegramId: "Telegram ID",
    displayName: "Имя",
    submit: "Войти"
  },
  requester: {
    homeTitle: "Выберите тип услуги",
    homeSubtitle: "Выберите услугу, чтобы быстро и точно отправить заявку",
    myRequestsTitle: "Мои заявки",
    noRequestsTitle: "Заявок пока нет",
    noRequestsDescription: "Выберите тип услуги выше, чтобы создать новую заявку.",
    openChat: "Начать заявку",
    noDomains: "Типы услуг пока не добавлены",
    chatTitle: "Создание заявки",
    chatHint: "Здесь вы пошагово заполняете данные для заявки",
    chatNoMessages: "Опишите проблему, обязательные данные будут запрошены по шагам.",
    statusTitle: "Статус заявки",
    summaryTitle: "Краткая информация",
    summaryId: "Код",
    summaryStatus: "Статус",
    summaryProblem: "Проблема",
    summaryAddress: "Адрес",
    missingTitle: "Недостающие поля",
    readyToDispatch: "Заявка готова к отправке",
    confirmIntake: "Подтвердить",
    confirmedIntake: "Заявка подтверждена как готовая.",
    dispatch: "Отправить мастерам",
    dispatched: "Заявка отправлена в группу мастеров.",
    dataSentToMasters: "Ваши данные отправлены мастерам.",
    dispatchUntil: "Срок текущего диспетча",
    goStatus: "Перейти к статусу",
    continueIntake: "Вернуться в чат",
    cancelRequest: "Отменить заявку",
    cancelBlocked: "На этом этапе отмена только через администратора.",
    cancelSentToAdmin: "Запрос на отмену отправлен администратору. Статус обновится после проверки админом.",
    domainLabel: "Выбранная услуга",
    loadingRequest: "Загрузка заявки...",
    composerDisabled: "В этом статусе чат закрыт.",
    mapAddressTitle: "Выберите адрес на карте",
    mapAddressSave: "Сохранить адрес",
    mapLocateMe: "Мое местоположение",
    formPhone: "Номер телефона",
    formVisitTime: "Дата и время визита",
    formVisitTimeHint: "Время, когда мастер приедет к вам по вашей заявке",
    formProblem: "Описание проблемы",
    formSubmit: "Отправить мастерам",
    formAddressRequired: "Сначала сохраните адрес на карте.",
    offtopicRefusal: "Я кратко отвечу и продолжу оформление заявки.",
    composerPlaceholder: "Опишите проблему...",
    statusDraft: "Черновик",
    statusIntakeInProgress: "Уточнение данных",
    statusReadyForDispatch: "Заявка создана",
    statusDispatched: "Отправлено",
    statusInFulfillment: "Мастер принял",
    statusClosedCompleted: "Завершена",
    statusClosedCanceledUser: "Отменена клиентом",
    statusClosedCanceledAdmin: "Отменена админом",
    statusClosedUnfulfilled: "Не выполнена"
  },
  fields: {
    service_domain: "Тип услуги",
    issue_type: "Тип проблемы",
    problem_summary: "Краткое описание проблемы",
    phone: "Номер телефона",
    address: "Адрес",
    landmark: "Ориентир",
    urgency: "Срочность",
    visit_time: "Предпочтительное время визита",
    consent: "Согласие на передачу данных мастерам"
  }
};
const messages = {
  uz_cyrl: uzCyrl,
  ru
};
function resolvePath(obj, path) {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return null;
    }
    current = current[part];
  }
  return typeof current === "string" ? current : null;
}
function useAppI18n() {
  const locale = useState("app-locale", () => "uz_cyrl");
  const t = (key) => {
    const fromLocale = resolvePath(messages[locale.value], key);
    if (fromLocale) return fromLocale;
    const fallback = resolvePath(messages.uz_cyrl, key);
    return fallback ?? key;
  };
  const setLocale = (value) => {
    locale.value = value;
  };
  return {
    locale,
    t,
    setLocale,
    locales: [
      { code: "uz_cyrl", label: t("locale.uz_cyrl") },
      { code: "ru", label: t("locale.ru") }
    ]
  };
}
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "AppHeader",
  __ssrInlineRender: true,
  props: {
    title: {},
    subtitle: { default: "" },
    logoText: { default: "FF" },
    showLocaleSwitch: { type: Boolean, default: true },
    showBackButton: { type: Boolean, default: false },
    backTo: { default: "" }
  },
  setup(__props) {
    const props = __props;
    const { locale, t } = useAppI18n();
    useRouter();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "sticky top-0 z-20 border-b border-white/60 bg-[#edf2ef]/80 shadow-[0_10px_28px_rgba(108,126,115,0.16)] backdrop-blur-xl" }, _attrs))}><div class="h-1 w-full bg-[#7a62ea]"></div><div class="ff-shell flex items-start gap-3 px-4 py-3.5">`);
      if (props.showBackButton) {
        _push(`<button type="button" class="ff-action mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center text-[#366a57]"${ssrRenderAttr("aria-label", unref(t)("common.back"))}>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-chevron-left",
          class: "size-5"
        }, null, _parent));
        _push(`</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="button" class="ff-action flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden p-1" aria-label="Go home"><img${ssrRenderAttr("src", _imports_0)} alt="fixFlow logo" class="h-full w-full rounded-xl object-cover"></button><div class="min-w-0 flex-1"><div class="flex items-baseline gap-2"><h1 class="${ssrRenderClass([props.title === "HGS" ? "text-orange-500" : "text-[#223027]", "truncate text-[18px] font-extrabold"])}">${ssrInterpolate(props.title)}</h1>`);
      if (props.title === "HGS") {
        _push(`<span class="truncate text-[10px] font-semibold uppercase tracking-wide text-violet-600"> Home Guarantee Service </span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (props.subtitle) {
        _push(`<p class="mt-0.5 text-xs leading-4 text-[#6d7c70]">${ssrInterpolate(props.subtitle)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (props.showLocaleSwitch) {
        _push(`<div class="ff-pressed grid shrink-0 grid-cols-2 rounded-2xl p-1"><button type="button" class="${ssrRenderClass([unref(locale) === "uz_cyrl" ? "ff-primary-gradient text-white" : "text-[#6d7c70] hover:text-[#223027]", "rounded-[9px] px-2 py-1 text-[11px] font-bold transition"])}"> Ўз </button><button type="button" class="${ssrRenderClass([unref(locale) === "ru" ? "ff-primary-gradient text-white" : "text-[#6d7c70] hover:text-[#223027]", "rounded-[9px] px-2 py-1 text-[11px] font-bold transition"])}"> Ру </button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></header>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppHeader.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$2, { __name: "AppHeader" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "LoadingState",
  __ssrInlineRender: true,
  props: {
    label: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "ff-panel-soft ff-rise rounded-3xl p-4" }, _attrs))}><div class="flex items-center gap-3.5"><div class="ff-primary-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-loader-2",
        class: "size-5 animate-spin text-white [--icon-stroke-width:2.5]"
      }, null, _parent));
      _push(`</div><div class="min-w-0 flex-1"><p class="text-sm font-semibold text-[#7d78a6]">${ssrInterpolate(props.label)}</p><div class="ff-pressed mt-2 h-2 w-full overflow-hidden rounded-full"><div class="h-full w-1/2 animate-pulse rounded-full bg-[#7a62ea]"></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LoadingState.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = Object.assign(_sfc_main$1, { __name: "LoadingState" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ErrorState",
  __ssrInlineRender: true,
  props: {
    title: {},
    message: { default: "" },
    retryLabel: { default: "" }
  },
  emits: ["retry"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$e;
      const _component_UButton = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "ff-rise rounded-[28px] border border-[#ffb8c0]/70 bg-gradient-to-b from-[#fff0f2]/90 to-[#ffe1e6]/80 p-4 shadow-[8px_10px_22px_rgba(255,100,122,0.16),-6px_-6px_18px_rgba(255,255,255,0.78)]" }, _attrs))}><div class="flex items-start gap-2"><div class="rounded-xl bg-white/70 p-1.5 shadow-sm">`);
      _push(ssrRenderComponent(_component_UIcon, {
        name: "i-lucide-alert-triangle",
        class: "size-4 text-[#ff647a]"
      }, null, _parent));
      _push(`</div><div class="min-w-0"><p class="text-sm font-bold text-[#8e4055]">${ssrInterpolate(props.title)}</p>`);
      if (props.message) {
        _push(`<p class="mt-1 text-xs leading-5 text-[#9b5063]">${ssrInterpolate(props.message)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (props.retryLabel) {
        _push(ssrRenderComponent(_component_UButton, {
          size: "xs",
          color: "error",
          variant: "soft",
          class: "mt-3",
          onClick: ($event) => emit("retry")
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(props.retryLabel)}`);
            } else {
              return [
                createTextVNode(toDisplayString(props.retryLabel), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ErrorState.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_3 = Object.assign(_sfc_main, { __name: "ErrorState" });

export { __nuxt_component_0 as _, __nuxt_component_2 as a, __nuxt_component_3 as b, useAppI18n as u };;globalThis.__timing__.logEnd('Load chunks/build/ErrorState-iIpWDbpG');
//# sourceMappingURL=ErrorState-iIpWDbpG.mjs.map
