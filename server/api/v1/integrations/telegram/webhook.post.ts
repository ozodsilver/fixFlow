import { defineEventHandler, getHeader, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { sendTelegramUserMessage } from '~~/server/utils/telegram-dispatch'

interface TelegramUpdate {
  message?: {
    chat?: {
      id?: number
    }
    text?: string
  }
}

function buildMiniAppUrl(config: ReturnType<typeof useRuntimeConfig>) {
  const botUsername = String(config.telegramBotUsername || '').trim().replace(/^@/, '')
  const miniAppShortName = String(config.telegramMiniAppShortName || '').trim()

  if (botUsername && miniAppShortName) {
    return `https://t.me/${botUsername}/${miniAppShortName}`
  }

  if (botUsername) {
    return `https://t.me/${botUsername}`
  }

  if (config.miniAppBaseUrl) {
    return String(config.miniAppBaseUrl).replace(/\/+$/, '')
  }

  return ''
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const expectedSecret = String(config.telegramWebhookSecret || '').trim()

  if (expectedSecret) {
    const actualSecret = getHeader(event, 'x-telegram-bot-api-secret-token') || ''
    if (actualSecret !== expectedSecret) {
      apiError(403, 'access.forbidden', 'Invalid Telegram webhook secret')
    }
  }

  const update = await readBody<TelegramUpdate>(event)
  const message = update.message
  const chatId = message?.chat?.id
  const text = message?.text?.trim() || ''

  if (!chatId || !text.startsWith('/start')) {
    return ok({ ok: true, ignored: true })
  }

  if (!config.telegramBotToken) {
    apiError(500, 'config.missing', 'TELEGRAM_BOT_TOKEN is missing')
  }

  const miniAppUrl = buildMiniAppUrl(config)
  const startText = [
    'Ассалому алайкум! 👋',
    '',
    'HGS сизга керакли устани тез топишга ёрдам беради.',
    '',
    'Хизмат турини танланг, муаммони қисқача ёзинг, телефон ва манзилингизни киритинг.',
    '',
    'Бошлаш учун қуйидаги тугмани босинг:'
  ].join('\n')

  const sent = await sendTelegramUserMessage(
    config.telegramBotToken,
    chatId,
    startText,
    miniAppUrl ? { text: '🔧 Хизмат танлаш', url: miniAppUrl } : undefined
  )

  if (!sent.ok) {
    apiError(500, 'telegram.send_failed', 'Failed to send Telegram start message', { reason: sent.error })
  }

  return ok({ ok: true })
})
