<script setup lang="ts">
import type { ServiceDomain } from '~/types/requester'

const api = useRequesterApi()
const { t, locale } = useAppI18n()

const loading = ref(true)
const domains = ref<ServiceDomain[]>([])
const errorMessage = ref('')
const creatingRequestDomainId = ref<number | null>(null)

const localizedDomainName = (domain: ServiceDomain) =>
  locale.value === 'ru' ? domain.name_ru : domain.name_uz_cyrl

const extractRawParam = (input: string, key: string): string | null => {
  const normalized = input.startsWith('?') || input.startsWith('#') ? input.slice(1) : input
  if (!normalized) return null

  for (const part of normalized.split('&')) {
    if (part.startsWith(`${key}=`)) {
      const raw = part.slice(key.length + 1)
      if (!raw) return null
      try {
        return decodeURIComponent(raw)
      }
      catch {
        return raw
      }
    }
  }

  return null
}

const getTelegramInitData = (): string | null => {
  if (!process.client) return null
  const webApp = (window as Window & { Telegram?: { WebApp?: { initData?: string; ready?: () => void } } }).Telegram?.WebApp
  const fromSdk = webApp?.initData?.trim()
  if (fromSdk) return fromSdk

  const fromQuery = extractRawParam(window.location.search, 'tgWebAppData')
  if (fromQuery?.trim()) return fromQuery

  const fromHash = extractRawParam(window.location.hash, 'tgWebAppData')
  if (fromHash?.trim()) return fromHash

  const cached = sessionStorage.getItem('ff_tg_init_data')
  if (cached?.trim()) return cached

  return null
}

const waitForTelegramInitData = async (): Promise<string | null> => {
  const maxAttempts = 20
  const intervalMs = 120

  for (let i = 0; i < maxAttempts; i += 1) {
    const value = getTelegramInitData()
    if (value) return value
    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  return null
}

const tryTelegramAuth = async () => {
  if (!process.client) return

  const webApp = (window as Window & { Telegram?: { WebApp?: { ready?: () => void } } }).Telegram?.WebApp
  const initData = await waitForTelegramInitData()
  if (!initData) {
    throw new Error('auth.invalid_init_data')
  }

  webApp?.ready?.()
  sessionStorage.setItem('ff_tg_init_data', initData)

  await api.initAuth({
    init_data: initData,
    locale: locale.value
  })
}

const init = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    // 1) Try with existing session cookie first.
    const domainsRes = await api.getServiceDomains()
    domains.value = domainsRes.data
  }
  catch (error: unknown) {
    const firstCode = (error as { data?: { error?: { code?: string } } })?.data?.error?.code
    const firstStatus = (error as { statusCode?: number })?.statusCode

    if (firstCode === 'auth.session_expired' || firstStatus === 401) {
      try {
        // 2) If session is missing, authenticate via Telegram initData and retry.
        await tryTelegramAuth()
        const domainsRes = await api.getServiceDomains()
        domains.value = domainsRes.data
        return
      }
      catch (authError: unknown) {
        const authCode = (authError as { data?: { error?: { code?: string; message?: string } } })?.data?.error?.code
        const authMessage = (authError as { data?: { error?: { message?: string } } })?.data?.error?.message || ''
        if (authCode === 'auth.invalid_init_data' || (authError as Error).message === 'auth.invalid_init_data') {
          if (authMessage.includes('not configured')) {
            errorMessage.value = 'Server sozlamasida Telegram bot token kiritilmagan.'
          }
          else {
            errorMessage.value = "Mini Appni bot ichidagi 'Open App' tugmasidan oching."
          }
        }
        else {
          errorMessage.value =
            (authError as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
        }
      }
    }
    else {
      errorMessage.value =
        (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
    }
  }
  finally {
    loading.value = false
  }
}

const openDomain = async (domain: ServiceDomain) => {
  creatingRequestDomainId.value = domain.id

  try {
    const created = await api.createRequest({
      domain_id: domain.id,
      locale: locale.value
    })

    await navigateTo(`/requester/requests/${created.data.request_id}/intake`)
  }
  catch (error: unknown) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
  }
  finally {
    creatingRequestDomainId.value = null
  }
}

onMounted(init)
</script>

<template>
  <div class="mx-auto min-h-dvh w-full max-w-md bg-slate-50">
    <AppHeader :title="t('common.appName')" :subtitle="t('requester.homeSubtitle')" logo-text="FF" />

    <main class="space-y-4 px-4 py-4">
      <h2 class="text-sm font-semibold text-slate-800">{{ t('requester.homeTitle') }}</h2>

      <LoadingState v-if="loading" :label="t('common.loading')" />

      <ErrorState
        v-else-if="errorMessage"
        :title="t('common.unexpectedError')"
        :message="errorMessage"
        :retry-label="t('common.retry')"
        @retry="init"
      />

      <EmptyState
        v-else-if="domains.length === 0"
        :title="t('common.noData')"
        :description="t('requester.noDomains')"
      />

      <div v-else class="space-y-3">
        <ServiceDomainCard
          v-for="domain in domains"
          :key="domain.id"
          :domain="domain"
          :title="localizedDomainName(domain)"
          :subtitle="t('requester.openChat')"
          @select="openDomain"
        />

        <p v-if="creatingRequestDomainId" class="text-xs text-slate-500">
          {{ t('common.loading') }}
        </p>
      </div>
    </main>
  </div>
</template>
