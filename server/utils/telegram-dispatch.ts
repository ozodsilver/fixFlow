import type { H3Event } from 'h3'
import { getSupabaseAdmin } from './supabase-admin'

interface DispatchPreviewInput {
  public_code: string
  domain_id: number
  problem_summary: string | null
  visit_time_mode: 'asap' | 'scheduled' | null
  visit_time_at: string | null
  locale: 'uz_cyrl' | 'ru'
}

interface AdminReviewNotificationInput {
  public_code: string
  requester_name: string
  phone_e164?: string | null
  problem_summary?: string | null
  locale: 'uz_cyrl' | 'ru'
}

interface MasterClaimNotificationInput {
  public_code: string
  requester_name?: string | null
  phone_e164?: string | null
  address_text?: string | null
  landmark_text?: string | null
  problem_summary?: string | null
  visit_time_mode?: 'asap' | 'scheduled' | null
  visit_time_at?: string | null
  locale: 'uz_cyrl' | 'ru'
}

function visitTimeLabel(mode: DispatchPreviewInput['visit_time_mode'], at: string | null, locale: DispatchPreviewInput['locale']) {
  if (mode === 'asap') return locale === 'ru' ? 'Срочно (ASAP)' : 'Шошилинч (ASAP)'
  if (mode === 'scheduled' && at) {
    const date = new Date(at)
    const formatted = Number.isNaN(date.getTime())
      ? at
      : new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'uz-Cyrl-UZ', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date)
    return formatted
  }
  return locale === 'ru' ? 'Не указано' : 'Кўрсатилмаган'
}

async function getDomainName(event: H3Event, domainId: number, locale: DispatchPreviewInput['locale']) {
  const supabase = getSupabaseAdmin(event)
  const { data } = await supabase
    .from('service_domains')
    .select('name_uz_cyrl, name_ru')
    .eq('id', domainId)
    .maybeSingle()

  if (!data) return `#${domainId}`
  return locale === 'ru' ? data.name_ru : data.name_uz_cyrl
}

export async function buildDispatchPreviewText(event: H3Event, input: DispatchPreviewInput) {
  const domainName = await getDomainName(event, input.domain_id, input.locale)
  const intro = input.locale === 'ru' ? 'Новая заявка' : 'Янги мурожаат'
  const summaryTitle = input.locale === 'ru' ? 'Кратко' : 'Қисқача'
  const timeTitle = input.locale === 'ru' ? 'Клиент ждет мастера' : 'Мурожаатчи мастерни кутади'
  const privacyNote =
    input.locale === 'ru'
      ? 'Телефон и точный адрес откроются только после успешного принятия заказа.'
      : 'Телефон ва аниқ манзил буюртма муваффақиятли қабул қилингандан кейин очилади.'

  return [
    `📌 ${intro}: ${input.public_code}`,
    `🛠️ ${input.locale === 'ru' ? 'Услуга' : 'Хизмат'}: ${domainName}`,
    `📝 ${summaryTitle}: ${input.problem_summary || (input.locale === 'ru' ? 'Не указано' : 'Кўрсатилмаган')}`,
    `⏰ ${timeTitle}: ${visitTimeLabel(input.visit_time_mode, input.visit_time_at, input.locale)}`,
    `🔒 ${privacyNote}`
  ].join('\n')
}

export function buildAdminReviewNotificationText(input: AdminReviewNotificationInput) {
  const problem = input.problem_summary || (input.locale === 'ru' ? 'Не указано' : 'Кўрсатилмаган')
  const phone = input.phone_e164 || (input.locale === 'ru' ? 'Не указано' : 'Кўрсатилмаган')

  if (input.locale === 'ru') {
    return [
      `🆕 Новая заявка ожидает проверки: ${input.public_code}`,
      `Клиент: ${input.requester_name}`,
      `Телефон: ${phone}`,
      `Проблема: ${problem}`,
      '',
      'Откройте админ-панель и подтвердите отправку мастерам.'
    ].join('\n')
  }

  return [
    `🆕 Янги мурожаат текширув кутяпти: ${input.public_code}`,
    `Мижоз: ${input.requester_name}`,
    `Телефон: ${phone}`,
    `Муаммо: ${problem}`,
    '',
    'Админ панелга кириб, усталарга юборишни тасдиқланг.'
  ].join('\n')
}

export function buildMasterClaimNotificationText(input: MasterClaimNotificationInput) {
  const problem = input.problem_summary || (input.locale === 'ru' ? 'Не указано' : 'Кўрсатилмаган')
  const phone = input.phone_e164 || (input.locale === 'ru' ? 'Не указано' : 'Кўрсатилмаган')
  const address = input.address_text || (input.locale === 'ru' ? 'Не указано' : 'Кўрсатилмаган')
  const requester = input.requester_name || (input.locale === 'ru' ? 'Клиент' : 'Мижоз')
  const time = visitTimeLabel(input.visit_time_mode || null, input.visit_time_at || null, input.locale)
  const landmark = input.landmark_text ? `\n${input.locale === 'ru' ? 'Ориентир' : 'Мўлжал'}: ${input.landmark_text}` : ''

  if (input.locale === 'ru') {
    return [
      `✅ Заказ принят: ${input.public_code}`,
      `Клиент: ${requester}`,
      `Телефон: ${phone}`,
      `Адрес: ${address}${landmark}`,
      `Время: ${time}`,
      `Проблема: ${problem}`,
      '',
      'После завершения работы сообщите сумму администратору. Комиссия платформы: 5%.'
    ].join('\n')
  }

  return [
    `✅ Буюртма қабул қилинди: ${input.public_code}`,
    `Мижоз: ${requester}`,
    `Телефон: ${phone}`,
    `Манзил: ${address}${landmark}`,
    `Вақт: ${time}`,
    `Муаммо: ${problem}`,
    '',
    'Иш тугагач суммани админга билдиринг. Платформа комиссияси: 5%.'
  ].join('\n')
}

export async function isTelegramChatMember(
  botToken: string,
  chatId: number,
  telegramUserId: number
): Promise<{ ok: boolean; isMember: boolean; error?: string }> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${chatId}&user_id=${telegramUserId}`
    const response = await fetch(url)
    const payload = await response.json() as {
      ok?: boolean
      result?: { status?: string; is_member?: boolean }
      description?: string
    }

    if (!response.ok || !payload.ok || !payload.result?.status) {
      return { ok: false, isMember: false, error: payload.description || `HTTP ${response.status}` }
    }

    const status = payload.result.status
    const isMember =
      status === 'creator'
      || status === 'administrator'
      || status === 'member'
      || (status === 'restricted' && payload.result.is_member === true)

    return { ok: true, isMember }
  }
  catch (error) {
    return {
      ok: false,
      isMember: false,
      error: error instanceof Error ? error.message : 'Unknown Telegram getChatMember error'
    }
  }
}

export async function sendTelegramUserMessage(
  botToken: string,
  telegramUserId: number,
  text: string,
  button?: { text: string; url: string }
): Promise<{ messageId: number | null; ok: boolean; error?: string }> {
  try {
    const payloadBody: Record<string, unknown> = {
      chat_id: telegramUserId,
      text
    }
    if (button?.text && button.url) {
      payloadBody.reply_markup = {
        inline_keyboard: [[{ text: button.text, url: button.url }]]
      }
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadBody)
    })

    let payload: { ok?: boolean; result?: { message_id?: number }; description?: string } | null = null
    try {
      payload = await response.json() as { ok?: boolean; result?: { message_id?: number }; description?: string }
    }
    catch {
      payload = null
    }

    if (!response.ok || !payload?.ok) {
      return { ok: false, messageId: null, error: payload?.description || `HTTP ${response.status}` }
    }

    return { ok: true, messageId: payload.result?.message_id ?? null }
  }
  catch (error) {
    return {
      ok: false,
      messageId: null,
      error: error instanceof Error ? error.message : 'Unknown Telegram send error'
    }
  }
}

export async function sendTelegramDispatchMessage(
  botToken: string,
  groupId: number,
  text: string,
  button?: { text: string; url?: string; webAppUrl?: string }
): Promise<{ messageId: number | null; ok: boolean; error?: string }> {
  const sendOnce = async (inlineButton?: Record<string, unknown>) => {
    const payloadBody: Record<string, unknown> = {
      chat_id: groupId,
      text
    }
    if (inlineButton) {
      payloadBody.reply_markup = { inline_keyboard: [[inlineButton]] }
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadBody)
    })

    const payload = await response.json() as { ok?: boolean; result?: { message_id?: number }; description?: string }
    if (!response.ok || !payload.ok) {
      return { ok: false as const, error: payload.description || `HTTP ${response.status}` }
    }
    return { ok: true as const, messageId: payload.result?.message_id ?? null }
  }

  if (!button?.text || (!button.webAppUrl && !button.url)) {
    const sent = await sendOnce()
    return sent.ok
      ? { ok: true, messageId: sent.messageId }
      : { ok: false, messageId: null, error: sent.error }
  }

  if (button.webAppUrl) {
    const webAppSent = await sendOnce({ text: button.text, web_app: { url: button.webAppUrl } })
    if (webAppSent.ok) {
      return { ok: true, messageId: webAppSent.messageId }
    }

    if (button.url) {
      const urlSent = await sendOnce({ text: button.text, url: button.url })
      if (urlSent.ok) {
        return { ok: true, messageId: urlSent.messageId }
      }
      return { ok: false, messageId: null, error: `${webAppSent.error}; fallback failed: ${urlSent.error}` }
    }

    return { ok: false, messageId: null, error: webAppSent.error }
  }

  const urlSent = await sendOnce({ text: button.text, url: button.url })
  return urlSent.ok
    ? { ok: true, messageId: urlSent.messageId }
    : { ok: false, messageId: null, error: urlSent.error }
}
