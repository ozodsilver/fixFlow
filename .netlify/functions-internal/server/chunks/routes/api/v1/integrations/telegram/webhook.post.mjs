globalThis.__timing__.logStart('Load chunks/routes/api/v1/integrations/telegram/webhook.post');import { d as defineEventHandler, u as useRuntimeConfig, l as getHeader, a as apiError, r as readBody, o as ok, m as sendTelegramUserMessage } from '../../../../../nitro/nitro.mjs';
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

function buildMiniAppUrl(config) {
  const botUsername = String(config.telegramBotUsername || "").trim().replace(/^@/, "");
  const miniAppShortName = String(config.telegramMiniAppShortName || "").trim();
  if (botUsername && miniAppShortName) {
    return `https://t.me/${botUsername}/${miniAppShortName}`;
  }
  if (botUsername) {
    return `https://t.me/${botUsername}`;
  }
  if (config.miniAppBaseUrl) {
    return String(config.miniAppBaseUrl).replace(/\/+$/, "");
  }
  return "";
}
const webhook_post = defineEventHandler(async (event) => {
  var _a, _b;
  const config = useRuntimeConfig(event);
  const expectedSecret = String(config.telegramWebhookSecret || "").trim();
  if (expectedSecret) {
    const actualSecret = getHeader(event, "x-telegram-bot-api-secret-token") || "";
    if (actualSecret !== expectedSecret) {
      apiError(403, "access.forbidden", "Invalid Telegram webhook secret");
    }
  }
  const update = await readBody(event);
  const message = update.message;
  const chatId = (_a = message == null ? void 0 : message.chat) == null ? void 0 : _a.id;
  const text = ((_b = message == null ? void 0 : message.text) == null ? void 0 : _b.trim()) || "";
  if (!chatId || !text.startsWith("/start")) {
    return ok({ ok: true, ignored: true });
  }
  if (!config.telegramBotToken) {
    apiError(500, "config.missing", "TELEGRAM_BOT_TOKEN is missing");
  }
  const miniAppUrl = buildMiniAppUrl(config);
  const startText = [
    "\u0410\u0441\u0441\u0430\u043B\u043E\u043C\u0443 \u0430\u043B\u0430\u0439\u043A\u0443\u043C! \u{1F44B}",
    "",
    "HGS \u0441\u0438\u0437\u0433\u0430 \u043A\u0435\u0440\u0430\u043A\u043B\u0438 \u0443\u0441\u0442\u0430\u043D\u0438 \u0442\u0435\u0437 \u0442\u043E\u043F\u0438\u0448\u0433\u0430 \u0451\u0440\u0434\u0430\u043C \u0431\u0435\u0440\u0430\u0434\u0438.",
    "",
    "\u0425\u0438\u0437\u043C\u0430\u0442 \u0442\u0443\u0440\u0438\u043D\u0438 \u0442\u0430\u043D\u043B\u0430\u043D\u0433, \u043C\u0443\u0430\u043C\u043C\u043E\u043D\u0438 \u049B\u0438\u0441\u049B\u0430\u0447\u0430 \u0451\u0437\u0438\u043D\u0433, \u0442\u0435\u043B\u0435\u0444\u043E\u043D \u0432\u0430 \u043C\u0430\u043D\u0437\u0438\u043B\u0438\u043D\u0433\u0438\u0437\u043D\u0438 \u043A\u0438\u0440\u0438\u0442\u0438\u043D\u0433.",
    "",
    "\u0411\u043E\u0448\u043B\u0430\u0448 \u0443\u0447\u0443\u043D \u049B\u0443\u0439\u0438\u0434\u0430\u0433\u0438 \u0442\u0443\u0433\u043C\u0430\u043D\u0438 \u0431\u043E\u0441\u0438\u043D\u0433:"
  ].join("\n");
  const sent = await sendTelegramUserMessage(
    config.telegramBotToken,
    chatId,
    startText,
    miniAppUrl ? { text: "\u{1F527} \u0425\u0438\u0437\u043C\u0430\u0442 \u0442\u0430\u043D\u043B\u0430\u0448", url: miniAppUrl } : void 0
  );
  if (!sent.ok) {
    apiError(500, "telegram.send_failed", "Failed to send Telegram start message", { reason: sent.error });
  }
  return ok({ ok: true });
});

export { webhook_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/v1/integrations/telegram/webhook.post');
//# sourceMappingURL=webhook.post.mjs.map
