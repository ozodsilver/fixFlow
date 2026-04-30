import type { H3Event } from 'h3'
import { getSupabaseAdmin } from './supabase-admin'

interface DispatchPreviewInput {
  public_code: string
  domain_id: number
  issue_custom: string | null
  problem_summary: string | null
  urgency: 'low' | 'normal' | 'high' | 'emergency' | null
  visit_time_mode: 'asap' | 'scheduled' | null
  visit_time_at: string | null
  locale: 'uz_cyrl' | 'ru'
}

function urgencyLabel(value: DispatchPreviewInput['urgency'], locale: DispatchPreviewInput['locale']) {
  const uz = {
    low: 'Паст',
    normal: 'Ўртача',
    high: 'Юқори',
    emergency: 'Фавқулодда'
  }
  const ru = {
    low: 'Низкая',
    normal: 'Обычная',
    high: 'Высокая',
    emergency: 'Аварийная'
  }
  if (!value) return locale === 'ru' ? 'Не указано' : 'Кўрсатилмаган'
  return locale === 'ru' ? ru[value] : uz[value]
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
  const issueTitle = input.locale === 'ru' ? 'Тип проблемы' : 'Муаммо тури'
  const summaryTitle = input.locale === 'ru' ? 'Кратко' : 'Қисқача'
  const urgencyTitle = input.locale === 'ru' ? 'Срочность' : 'Шошилинчлик'
  const timeTitle = input.locale === 'ru' ? 'Клиент ждет мастера' : 'Мурожаатчи мастерни кутади'
  const privacyNote =
    input.locale === 'ru'
      ? 'Контакты и точный адрес откроются только после успешного claim.'
      : 'Телефон ва аниқ манзил фақат муваффақиятли claimдан кейин очилади.'

  return [
    `📌 ${intro}: ${input.public_code}`,
    `${input.locale === 'ru' ? 'Услуга' : 'Хизмат'}: ${domainName}`,
    `${issueTitle}: ${input.issue_custom || (input.locale === 'ru' ? 'Не указано' : 'Кўрсатилмаган')}`,
    `${summaryTitle}: ${input.problem_summary || (input.locale === 'ru' ? 'Не указано' : 'Кўрсатилмаган')}`,
    `${urgencyTitle}: ${urgencyLabel(input.urgency, input.locale)}`,
    `${timeTitle}: ${visitTimeLabel(input.visit_time_mode, input.visit_time_at, input.locale)}`,
    `ℹ️ ${privacyNote}`
  ].join('\n')
}

export async function sendTelegramDispatchMessage(
  botToken: string,
  groupId: number,
  text: string,
  button?: { text: string; url: string }
): Promise<{ messageId: number | null; ok: boolean; error?: string }> {
  const payloadBody: Record<string, unknown> = {
    chat_id: groupId,
    text
  }
  if (button?.text && button?.url) {
    payloadBody.reply_markup = {
      inline_keyboard: [[{ text: button.text, url: button.url }]]
    }
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payloadBody)
  })

  if (!response.ok) {
    return { ok: false, messageId: null, error: `HTTP ${response.status}` }
  }

  const payload = await response.json() as { ok?: boolean; result?: { message_id?: number }; description?: string }
  if (!payload.ok) {
    return { ok: false, messageId: null, error: payload.description || 'Telegram API error' }
  }

  return { ok: true, messageId: payload.result?.message_id ?? null }
}
