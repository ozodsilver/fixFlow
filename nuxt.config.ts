// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/image', '@nuxt/ui'],
  css: ['~/assets/css/main.css', '~/assets/scss/main.scss'],
  runtimeConfig: {
    sessionSecret: process.env.SESSION_SECRET || '',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramMastersGroupId: process.env.TELEGRAM_MASTERS_GROUP_ID || '0',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      allowDevAuthBypass: process.env.NODE_ENV !== 'production'
    }
  }
})
