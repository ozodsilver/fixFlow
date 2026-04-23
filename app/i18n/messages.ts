import type { AppLocale } from '~/types/requester'

type MessageTree = Record<string, string | MessageTree>

const uzCyrl: MessageTree = {
  common: {
    appName: 'FixFlow',
    loading: 'Юкланмоқда...',
    retry: 'Қайта уриниш',
    noData: 'Маълумот топилмади',
    unexpectedError: 'Кутилмаган хато юз берди',
    send: 'Юбориш',
    cancel: 'Бекор қилиш',
    back: 'Ортга',
    status: 'Ҳолат'
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
    openChat: 'Мурожаатни бошлаш',
    noDomains: 'Хизмат турлари ҳозирча мавжуд эмас',
    chatTitle: 'Мурожаат чати',
    chatHint: 'AI фақат хизмат бўйича савол беради',
    statusTitle: 'Мурожаат ҳолати',
    summaryTitle: 'Қисқача маълумот',
    missingTitle: 'Етишмаётган маълумотлар',
    readyToDispatch: 'Мурожаат юборишга тайёр',
    confirmIntake: 'Тасдиқлаш',
    dispatch: 'Усталарга юбориш',
    offtopicRefusal: 'Кечирасиз, мен фақат хизмат бўйича жавоб бераман.',
    composerPlaceholder: 'Муаммо ҳақида ёзинг...'
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
    noData: 'Данные не найдены',
    unexpectedError: 'Произошла непредвиденная ошибка',
    send: 'Отправить',
    cancel: 'Отмена',
    back: 'Назад',
    status: 'Статус'
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
    openChat: 'Начать заявку',
    noDomains: 'Типы услуг пока не добавлены',
    chatTitle: 'Чат заявки',
    chatHint: 'AI отвечает только по сервисной заявке',
    statusTitle: 'Статус заявки',
    summaryTitle: 'Краткая информация',
    missingTitle: 'Недостающие поля',
    readyToDispatch: 'Заявка готова к отправке',
    confirmIntake: 'Подтвердить',
    dispatch: 'Отправить мастерам',
    offtopicRefusal: 'Извините, я отвечаю только по вопросам услуг.',
    composerPlaceholder: 'Опишите проблему...'
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
