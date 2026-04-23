import type { AppLocale } from '~/types/requester'

type MessageTree = Record<string, string | MessageTree>

const uzCyrl: MessageTree = {
  common: {
    appName: 'FixFlow',
    loading: 'Юкланмоқда...',
    retry: 'Қайта уриниш',
    refresh: 'Янгилаш',
    noData: 'Маълумот топилмади',
    unexpectedError: 'Кутилмаган хато юз берди',
    send: 'Юбориш',
    cancel: 'Бекор қилиш',
    confirm: 'Тасдиқлаш',
    back: 'Ортга',
    status: 'Ҳолат',
    open: 'Очиш'
  },
  locale: {
    uz_cyrl: 'Ўзбекча',
    ru: 'Русча'
  },
  auth: {
    title: 'Локал кириш (dev)',
    subtitle: 'Telegram initData ҳали уланмаган бўлса, тест user билан киринг',
    telegramId: 'Telegram ID',
    displayName: 'Исм',
    submit: 'Кириш'
  },
  requester: {
    homeTitle: 'Хизмат турини танланг',
    homeSubtitle: 'Муаммоингизни тез ва аниқ юбориш учун хизмат турини танланг',
    myRequestsTitle: 'Менинг мурожаатларим',
    noRequestsTitle: 'Мурожаатлар ҳали йўқ',
    noRequestsDescription: 'Янги мурожаат яратиш учун юқоридаги хизмат турини танланг.',
    openChat: 'Мурожаатни бошлаш',
    noDomains: 'Хизмат турлари ҳозирча мавжуд эмас',
    chatTitle: 'Мурожаат чати',
    chatHint: 'AI саволингизга жавоб беради ва мурожаат маълумотини йиғади',
    chatNoMessages: 'Муаммони ёзинг, AI керакли маълумотларни босқичма-босқич сўрайди.',
    statusTitle: 'Мурожаат ҳолати',
    summaryTitle: 'Қисқача маълумот',
    summaryId: 'Код',
    summaryStatus: 'Ҳолат',
    summaryProblem: 'Муаммо',
    summaryAddress: 'Манзил',
    missingTitle: 'Етишмаётган маълумотлар',
    readyToDispatch: 'Мурожаат юборишга тайёр',
    confirmIntake: 'Тасдиқлаш',
    confirmedIntake: 'Мурожаат тайёр деб тасдиқланди.',
    dispatch: 'Усталарга юбориш',
    dispatched: 'Мурожаат усталар гуруҳига юборилди.',
    dispatchUntil: 'Жорий диспетч тугаш вақти',
    goStatus: 'Ҳолат саҳифасига ўтиш',
    continueIntake: 'Чатга қайтиш',
    cancelRequest: 'Мурожаатни бекор қилиш',
    cancelBlocked: 'Бу босқичда мурожаатни фақат админ бекор қила олади.',
    domainLabel: 'Танланган хизмат',
    loadingRequest: 'Мурожаат юкланмоқда...',
    composerDisabled: 'Бу ҳолатда чат ёпиқ.',
    offtopicRefusal: 'Саволингизга қисқа жавоб бериб, мурожаатни давом эттираман.',
    composerPlaceholder: 'Муаммо ҳақида ёзинг...',
    statusDraft: 'Қоралама',
    statusIntakeInProgress: 'Маълумот йиғилмоқда',
    statusReadyForDispatch: 'Юборишга тайёр',
    statusDispatched: 'Усталарга юборилди',
    statusInFulfillment: 'Уста ишни олган',
    statusClosedCompleted: 'Якунланди',
    statusClosedCanceledUser: 'Мижоз бекор қилди',
    statusClosedCanceledAdmin: 'Админ бекор қилди',
    statusClosedUnfulfilled: 'Якунланмади'
  },
  fields: {
    service_domain: 'Хизмат тури',
    issue_type: 'Муаммо тури',
    problem_summary: 'Муаммо қисқача тавсифи',
    phone: 'Телефон рақами',
    address: 'Манзил',
    landmark: 'Мўлжал',
    urgency: 'Шошилинчлик даражаси',
    visit_time: 'Қачон келиши керак',
    consent: 'Маълумотни устага бериш розилиги'
  }
}

const ru: MessageTree = {
  common: {
    appName: 'FixFlow',
    loading: 'Загрузка...',
    retry: 'Повторить',
    refresh: 'Обновить',
    noData: 'Данные не найдены',
    unexpectedError: 'Произошла непредвиденная ошибка',
    send: 'Отправить',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    back: 'Назад',
    status: 'Статус',
    open: 'Открыть'
  },
  locale: {
    uz_cyrl: 'Узбекский',
    ru: 'Русский'
  },
  auth: {
    title: 'Локальный вход (dev)',
    subtitle: 'Если Telegram initData еще не подключен, войдите тестовым пользователем',
    telegramId: 'Telegram ID',
    displayName: 'Имя',
    submit: 'Войти'
  },
  requester: {
    homeTitle: 'Выберите тип услуги',
    homeSubtitle: 'Выберите услугу, чтобы быстро и точно отправить заявку',
    myRequestsTitle: 'Мои заявки',
    noRequestsTitle: 'Заявок пока нет',
    noRequestsDescription: 'Выберите тип услуги выше, чтобы создать новую заявку.',
    openChat: 'Начать заявку',
    noDomains: 'Типы услуг пока не добавлены',
    chatTitle: 'Чат заявки',
    chatHint: 'AI отвечает на вопросы и параллельно собирает заявку',
    chatNoMessages: 'Опишите проблему, AI пошагово соберет обязательные данные.',
    statusTitle: 'Статус заявки',
    summaryTitle: 'Краткая информация',
    summaryId: 'Код',
    summaryStatus: 'Статус',
    summaryProblem: 'Проблема',
    summaryAddress: 'Адрес',
    missingTitle: 'Недостающие поля',
    readyToDispatch: 'Заявка готова к отправке',
    confirmIntake: 'Подтвердить',
    confirmedIntake: 'Заявка подтверждена как готовая.',
    dispatch: 'Отправить мастерам',
    dispatched: 'Заявка отправлена в группу мастеров.',
    dispatchUntil: 'Срок текущего диспетча',
    goStatus: 'Перейти к статусу',
    continueIntake: 'Вернуться в чат',
    cancelRequest: 'Отменить заявку',
    cancelBlocked: 'На этом этапе отмена только через администратора.',
    domainLabel: 'Выбранная услуга',
    loadingRequest: 'Загрузка заявки...',
    composerDisabled: 'В этом статусе чат закрыт.',
    offtopicRefusal: 'Я кратко отвечу и продолжу оформление заявки.',
    composerPlaceholder: 'Опишите проблему...',
    statusDraft: 'Черновик',
    statusIntakeInProgress: 'Сбор данных',
    statusReadyForDispatch: 'Готова к отправке',
    statusDispatched: 'Отправлена мастерам',
    statusInFulfillment: 'Мастер принял',
    statusClosedCompleted: 'Завершена',
    statusClosedCanceledUser: 'Отменена клиентом',
    statusClosedCanceledAdmin: 'Отменена админом',
    statusClosedUnfulfilled: 'Не выполнена'
  },
  fields: {
    service_domain: 'Тип услуги',
    issue_type: 'Тип проблемы',
    problem_summary: 'Краткое описание проблемы',
    phone: 'Номер телефона',
    address: 'Адрес',
    landmark: 'Ориентир',
    urgency: 'Срочность',
    visit_time: 'Предпочтительное время визита',
    consent: 'Согласие на передачу данных мастерам'
  }
}

export const messages: Record<AppLocale, MessageTree> = {
  uz_cyrl: uzCyrl,
  ru
}
