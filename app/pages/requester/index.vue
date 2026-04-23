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

const ensureTelegramSession = async () => {
  if (!process.client) return

  const webApp = (window as Window & { Telegram?: { WebApp?: { initData?: string; ready?: () => void } } }).Telegram?.WebApp
  const initData = webApp?.initData?.trim()

  if (!initData) {
    throw new Error('auth.invalid_init_data')
  }

  webApp?.ready?.()

  await api.initAuth({
    init_data: initData,
    locale: locale.value
  })
}

const init = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    await ensureTelegramSession()

    const domainsRes = await api.getServiceDomains()
    domains.value = domainsRes.data
  }
  catch (error: unknown) {
    const code = (error as { data?: { error?: { code?: string; message?: string } } })?.data?.error?.code
    if (code === 'auth.invalid_init_data' || (error as Error).message === 'auth.invalid_init_data') {
      errorMessage.value = 'Mini Appni Telegram ichida oching.'
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
