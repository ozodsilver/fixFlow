<script setup lang="ts">
const route = useRoute()
const { t, locale } = useAppI18n()
const api = useRequesterApi()

const loading = ref(true)
const errorMessage = ref('')
const assignment = ref<any | null>(null)

const orderId = computed(() => String(route.params.orderId || ''))

const getErrorMessage = (error: unknown) =>
  (error as { data?: { error?: { message?: string }, message?: string }, message?: string })?.data?.error?.message
  || (error as { data?: { message?: string } })?.data?.message
  || (error as { message?: string })?.message
  || t('common.unexpectedError')

const extractRawParam = (input: string, key: string): string | null => {
  const normalized = input.startsWith('?') || input.startsWith('#') ? input.slice(1) : input
  if (!normalized) return null
  for (const part of normalized.split('&')) {
    if (!part.startsWith(`${key}=`)) continue
    const raw = part.slice(key.length + 1)
    if (!raw) return null
    try {
      return decodeURIComponent(raw)
    }
    catch {
      return raw
    }
  }
  return null
}

const tryTelegramAuth = async () => {
  const runtimeConfig = useRuntimeConfig()
  const webApp = process.client
    ? (window as Window & { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp
    : null
  const initData = process.client
    ? webApp?.initData?.trim()
      || extractRawParam(window.location.search, 'tgWebAppData')?.trim()
      || extractRawParam(window.location.hash, 'tgWebAppData')?.trim()
      || sessionStorage.getItem('ff_tg_init_data')
    : null

  if (initData) {
    sessionStorage.setItem('ff_tg_init_data', initData)
    await api.initAuth({ init_data: initData, locale: locale.value })
    return
  }

  if (runtimeConfig.public.allowDevAuthBypass) {
    const devTelegramUserId = Number(sessionStorage.getItem('ff_dev_tg_uid') || '900001')
    sessionStorage.setItem('ff_dev_tg_uid', String(devTelegramUserId))
    await api.initAuth({ telegram_user_id: devTelegramUserId, display_name: 'Dev Local Master', locale: locale.value })
  }
}

const loadOrder = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await $fetch<{ data: { assignment: any } }>(`/api/v1/master/orders/${orderId.value}`)
    assignment.value = res.data.assignment
  }
  catch (error: unknown) {
    const code = (error as { data?: { error?: { code?: string } } })?.data?.error?.code
    const statusCode = (error as { statusCode?: number })?.statusCode
    if (code === 'auth.session_expired' || statusCode === 401) {
      try {
        await tryTelegramAuth()
        const res = await $fetch<{ data: { assignment: any } }>(`/api/v1/master/orders/${orderId.value}`)
        assignment.value = res.data.assignment
        return
      }
      catch (retryError: unknown) {
        errorMessage.value = getErrorMessage(retryError) || 'Session ochilmadi. Mini App ichidan qayta ochib kiring.'
        return
      }
    }
    errorMessage.value = getErrorMessage(error)
  }
  finally {
    loading.value = false
  }
}

const order = computed(() => {
  const value = assignment.value?.orders
  return Array.isArray(value) ? value[0] : value
})

const request = computed(() => {
  const value = order.value?.service_requests
  return Array.isArray(value) ? value[0] : value
})

onMounted(loadOrder)
</script>

<template>
  <div class="ff-shell min-h-dvh px-4 py-4">
    <AppHeader title="Buyurtma" subtitle="Тўлиқ маълумот" logo-text="MS" :show-back-button="true" back-to="/master/orders" />

    <main class="mt-4 space-y-3">
      <LoadingState v-if="loading" :label="t('common.loading')" />
      <ErrorState v-else-if="errorMessage" :title="t('common.unexpectedError')" :message="errorMessage" :retry-label="t('common.retry')" @retry="loadOrder" />

      <template v-else-if="assignment && order && request">
        <section class="ff-panel rounded-3xl p-4 space-y-2">
          <div class="flex items-start justify-between gap-3">
            <p class="text-sm font-bold">{{ request.public_code }}</p>
            <span class="rounded-full bg-[#eee9ff] px-2 py-1 text-xs font-semibold text-[#5c4bd6]">{{ order.status }}</span>
          </div>
          <p class="text-sm text-slate-700">{{ request.problem_summary || '-' }}</p>
        </section>

        <section class="ff-panel rounded-3xl p-4 space-y-2">
          <p class="text-xs font-bold uppercase tracking-wide text-violet-700">Мижоз маълумотлари</p>
          <p class="text-sm text-slate-700">Телефон: <span class="font-semibold">{{ request.phone_e164 || '-' }}</span></p>
          <p class="text-sm text-slate-700">Манзил: <span class="font-semibold">{{ request.address_text || '-' }}</span></p>
          <p v-if="request.landmark_text" class="text-sm text-slate-700">Мўлжал: <span class="font-semibold">{{ request.landmark_text }}</span></p>
          <p class="text-sm text-slate-700">Вақт: <span class="font-semibold">{{ request.visit_time_at ? new Date(request.visit_time_at).toLocaleString() : request.visit_time_mode || '-' }}</span></p>
        </section>

        <section class="ff-panel rounded-3xl p-4 space-y-2">
          <p class="text-xs font-bold uppercase tracking-wide text-violet-700">Комиссия</p>
          <p class="text-sm text-slate-700">Фоиз: {{ order.commission_percent }}%</p>
          <p class="text-sm text-slate-700">Иш суммаси: {{ order.final_price_amount ? `${order.final_price_amount} сўм` : 'админ киритади' }}</p>
          <p class="text-sm text-slate-700">Админ улуши: {{ order.commission_amount ? `${order.commission_amount} сўм` : '-' }}</p>
          <p class="text-sm text-slate-700">Ҳолат: {{ order.commission_status }}</p>
        </section>
      </template>
    </main>
  </div>
</template>
