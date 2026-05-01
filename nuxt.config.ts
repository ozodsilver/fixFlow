// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  colorMode: {
    preference: 'light',
    fallback: 'light'
  },
  vite: {
    server: {
      allowedHosts: true
    }
  },
  modules: ['@nuxt/image', '@nuxt/ui'],
  css: ['~/assets/css/main.css', '~/assets/scss/main.scss'],
  app: {
    head: {
      script: [
        {
          src: 'https://telegram.org/js/telegram-web-app.js',
          defer: true
        }
      ]
    }
  },
  runtimeConfig: {
    sessionSecret: process.env.SESSION_SECRET || '',
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET || '',
    adminLogin: process.env.ADMIN_LOGIN || '',
    adminPassword: process.env.ADMIN_PASSWORD || '',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramAdminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || '0',
    telegramMastersGroupId: process.env.TELEGRAM_MASTERS_GROUP_ID || '0',
    miniAppBaseUrl: process.env.MINI_APP_BASE_URL || '',
    telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME || '',
    telegramMiniAppShortName: process.env.TELEGRAM_MINI_APP_SHORT_NAME || '',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      allowDevAuthBypass: process.env.NODE_ENV !== 'production'
    }
  }
})
