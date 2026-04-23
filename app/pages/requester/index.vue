<script setup lang="ts">
import type { RequestStatus, ServiceDomain, ServiceRequest } from '~/types/requester'

const api = useRequesterApi()
const { t, locale } = useAppI18n()

const loading = ref(true)
const domains = ref<ServiceDomain[]>([])
const requests = ref<ServiceRequest[]>([])
const errorMessage = ref('')
const creatingRequestDomainId = ref<number | null>(null)

const localizedDomainName = (domain: ServiceDomain) =>
  locale.value === 'ru' ? domain.name_ru : domain.name_uz_cyrl

const statusLabel = (status: RequestStatus) => {
  const map: Record<RequestStatus, string> = {
    draft: t('requester.statusDraft'),
    intake_in_progress: t('requester.statusIntakeInProgress'),
    ready_for_dispatch: t('requester.statusReadyForDispatch'),
    dispatched: t('requester.statusDispatched'),
    in_fulfillment: t('requester.statusInFulfillment'),
    closed_completed: t('requester.statusClosedCompleted'),
    closed_canceled_user: t('requester.statusClosedCanceledUser'),
    closed_canceled_admin: t('requester.statusClosedCanceledAdmin'),
    closed_unfulfilled: t('requester.statusClosedUnfulfilled')
  }

  return map[status] || status
}

const statusToneClass = (status: RequestStatus) => {
  if (status === 'draft' || status === 'intake_in_progress') return 'bg-amber-100 text-amber-800'
  if (status === 'ready_for_dispatch' || status === 'dispatched') return 'bg-sky-100 text-sky-800'
  if (status === 'in_fulfillment') return 'bg-emerald-100 text-emerald-800'
  if (status === 'closed_completed') return 'bg-teal-100 text-teal-800'
  return 'bg-slate-100 text-slate-700'
}

const intakeStatuses = new Set<RequestStatus>(['draft', 'intake_in_progress', 'ready_for_dispatch'])

const requestOpenPath = (request: ServiceRequest) =>
  intakeStatuses.has(request.status)
    ? `/requester/requests/${request.id}/intake`
    : `/requester/requests/${request.id}/status`

const topRequests = computed(() => requests.value.slice(0, 5))

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
    const [domainsRes, requestsRes] = await Promise.all([api.getServiceDomains(), api.getRequests()])
    domains.value = domainsRes.data
    requests.value = requestsRes.data.items
  }
  catch (error: unknown) {
    const firstCode = (error as { data?: { error?: { code?: string } } })?.data?.error?.code
    const firstStatus = (error as { statusCode?: number })?.statusCode

    if (firstCode === 'auth.session_expired' || firstStatus === 401) {
      try {
        // 2) If session is missing, authenticate via Telegram initData and retry.
        await tryTelegramAuth()
        const [domainsRes, requestsRes] = await Promise.all([api.getServiceDomains(), api.getRequests()])
        domains.value = domainsRes.data
        requests.value = requestsRes.data.items
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
  <div class="ff-shell min-h-dvh">
    <AppHeader :title="t('common.appName')" :subtitle="t('requester.homeSubtitle')" logo-text="FF" />

    <main class="space-y-5 px-4 py-4">
      <section class="ff-panel-soft ff-rise rounded-2xl p-4">
        <div class="flex items-start gap-3">
          <div class="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
            <UIcon name="i-lucide-life-buoy" class="size-5" />
          </div>
          <div class="min-w-0">
            <p class="text-sm font-extrabold tracking-tight text-slate-900">{{ t('requester.homeTitle') }}</p>
            <p class="mt-1 text-xs leading-5 text-slate-600">{{ t('requester.homeSubtitle') }}</p>
          </div>
        </div>
      </section>

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
        <div class="flex items-center justify-between">
          <h2 class="ff-section-title">{{ t('requester.homeTitle') }}</h2>
          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
            {{ domains.length }}
          </span>
        </div>

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

      <section v-if="!loading" class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <h3 class="ff-section-title">{{ t('requester.myRequestsTitle') }}</h3>
          <UButton size="xs" color="neutral" variant="ghost" @click="init">
            {{ t('common.refresh') }}
          </UButton>
        </div>

        <EmptyState
          v-if="topRequests.length === 0"
          :title="t('requester.noRequestsTitle')"
          :description="t('requester.noRequestsDescription')"
        />

        <div v-else class="space-y-2">
          <button
            v-for="request in topRequests"
            :key="request.id"
            type="button"
            class="ff-panel ff-rise w-full rounded-2xl p-3 text-left transition hover:-translate-y-0.5 hover:border-emerald-300"
            @click="navigateTo(requestOpenPath(request))"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-sm font-bold tracking-tight text-slate-900">{{ request.public_code }}</p>
                <p class="mt-1 truncate text-xs text-slate-600">
                  {{ request.problem_summary || t('requester.openChat') }}
                </p>
                <p class="mt-1">
                  <span class="ff-status-chip" :class="statusToneClass(request.status)">
                    {{ statusLabel(request.status) }}
                  </span>
                </p>
              </div>
              <span class="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                {{ t('common.open') }}
              </span>
            </div>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>
