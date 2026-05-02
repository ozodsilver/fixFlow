<script setup lang="ts">
const { t, locale } = useAppI18n()
const api = useRequesterApi()

const loading = ref(true)
const errorMessage = ref('')
const assignments = ref<any[]>([])

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

const getTelegramInitData = () => {
  if (!process.client) return null
  const webApp = (window as Window & { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp
  return webApp?.initData?.trim()
    || extractRawParam(window.location.search, 'tgWebAppData')?.trim()
    || extractRawParam(window.location.hash, 'tgWebAppData')?.trim()
    || sessionStorage.getItem('ff_tg_init_data')
}

const tryTelegramAuth = async () => {
  const runtimeConfig = useRuntimeConfig()
  const initData = getTelegramInitData()
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

const loadOrders = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await $fetch<{ data: { items: any[] } }>('/api/v1/master/orders')
    assignments.value = res.data.items || []
  }
  catch (error: unknown) {
    const code = (error as { data?: { error?: { code?: string } } })?.data?.error?.code
    const statusCode = (error as { statusCode?: number })?.statusCode
    if (code === 'auth.session_expired' || statusCode === 401) {
      try {
        await tryTelegramAuth()
        const res = await $fetch<{ data: { items: any[] } }>('/api/v1/master/orders')
        assignments.value = res.data.items || []
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

const orderOf = (assignment: any) => Array.isArray(assignment.orders) ? assignment.orders[0] : assignment.orders
const requestOf = (assignment: any) => {
  const order = orderOf(assignment)
  return Array.isArray(order?.service_requests) ? order.service_requests[0] : order?.service_requests
}

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    accepted: 'Қабул қилинган',
    in_progress: 'Жараёнда',
    completed: 'Якунланган',
    canceled_admin: 'Бекор қилинган'
  }
  return map[status] || status
}

onMounted(loadOrders)
</script>

<template>
  <div class="ff-shell min-h-dvh px-4 py-4">
    <AppHeader title="Master Orders" subtitle="Менинг буюртмаларим" logo-text="MS" :show-back-button="true" back-to="/" />

    <main class="mt-4 space-y-3">
      <LoadingState v-if="loading" :label="t('common.loading')" />
      <ErrorState v-else-if="errorMessage" :title="t('common.unexpectedError')" :message="errorMessage" :retry-label="t('common.retry')" @retry="loadOrders" />

      <section v-else-if="assignments.length === 0" class="ff-panel rounded-3xl p-4">
        <p class="text-sm text-slate-600">Ҳозирча сизга бириктирилган буюртмалар йўқ.</p>
      </section>

      <section
        v-for="assignment in assignments"
        v-else
        :key="assignment.id"
        class="ff-panel rounded-3xl p-4 space-y-2"
        @click="navigateTo(`/master/orders/${orderOf(assignment)?.id}`)"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm font-bold">{{ requestOf(assignment)?.public_code }}</p>
          <span class="rounded-full bg-[#eee9ff] px-2 py-1 text-xs font-semibold text-[#5c4bd6]">
            {{ statusLabel(orderOf(assignment)?.status) }}
          </span>
        </div>
        <p class="text-sm text-slate-700">{{ requestOf(assignment)?.problem_summary || '-' }}</p>
        <p class="text-xs text-slate-500">Вақт: {{ requestOf(assignment)?.visit_time_at ? new Date(requestOf(assignment)?.visit_time_at).toLocaleString() : requestOf(assignment)?.visit_time_mode || '-' }}</p>
        <p class="text-xs text-slate-500">Комиссия: {{ orderOf(assignment)?.commission_amount ? `${orderOf(assignment)?.commission_amount} сўм` : 'сумма киритилмаган' }}</p>
      </section>
    </main>
  </div>
</template>
