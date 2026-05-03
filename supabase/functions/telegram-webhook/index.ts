type TelegramUpdate = {
  message?: {
    chat?: {
      id?: number
    }
    text?: string
  }
}

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })

const buildMiniAppUrl = () => {
  const botUsername = (Deno.env.get('TELEGRAM_BOT_USERNAME') || '').trim().replace(/^@/, '')
  const miniAppShortName = (Deno.env.get('TELEGRAM_MINI_APP_SHORT_NAME') || '').trim()
  const miniAppBaseUrl = (Deno.env.get('MINI_APP_BASE_URL') || '').trim().replace(/\/+$/, '')

  if (botUsername && miniAppShortName) return `https://t.me/${botUsername}/${miniAppShortName}`
  if (botUsername) return `https://t.me/${botUsername}`
  return miniAppBaseUrl
}

const sendTelegramMessage = async (
  botToken: string,
  chatId: number,
  text: string,
  button?: { text: string; url: string }
) => {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text
  }

  if (button?.text && button.url) {
    payload.reply_markup = {
      inline_keyboard: [[{ text: button.text, url: button.url }]]
    }
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const result = await response.json().catch(() => null) as { ok?: boolean; description?: string } | null
  if (!response.ok || !result?.ok) {
    return { ok: false, error: result?.description || `HTTP ${response.status}` }
  }

  return { ok: true }
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return json({ ok: true, method: request.method })
  }

  const expectedSecret = (Deno.env.get('TELEGRAM_WEBHOOK_SECRET') || '').trim()
  if (expectedSecret) {
    const actualSecret = request.headers.get('x-telegram-bot-api-secret-token') || ''
    if (actualSecret !== expectedSecret) {
      return json({ ok: false, error: 'Invalid webhook secret' }, 403)
    }
  }

  const botToken = (Deno.env.get('TELEGRAM_BOT_TOKEN') || '').trim()
  if (!botToken) {
    return json({ ok: false, error: 'TELEGRAM_BOT_TOKEN is missing' }, 500)
  }

  const update = await request.json().catch(() => null) as TelegramUpdate | null
  const message = update?.message
  const chatId = message?.chat?.id
  const text = message?.text?.trim() || ''

  if (!chatId || !text.startsWith('/start')) {
    return json({ ok: true, ignored: true })
  }

  const miniAppUrl = buildMiniAppUrl()
  const startText = [
    'Ассалому алайкум! 👋',
    '',
    'HGS сизга керакли устани тез топишга ёрдам беради.',
    '',
    'Хизмат турини танланг, муаммони қисқача ёзинг, телефон ва манзилингизни киритинг.',
    '',
    'Бошлаш учун қуйидаги тугмани босинг:'
  ].join('\n')

  const sent = await sendTelegramMessage(
    botToken,
    chatId,
    startText,
    miniAppUrl ? { text: '🔧 Хизмат танлаш', url: miniAppUrl } : undefined
  )

  if (!sent.ok) {
    return json({ ok: false, error: sent.error || 'Failed to send Telegram message' }, 500)
  }

  return json({ ok: true })
})
