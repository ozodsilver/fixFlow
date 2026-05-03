<script setup lang="ts">
const route = useRoute()
const { t, locale } = useAppI18n()
const api = useRequesterApi()

const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const savingPrice = ref(false)
const assignment = ref<any | null>(null)
const finalPriceInput = ref('')

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
  successMessage.value = ''
  try {
    const res = await $fetch<{ data: { assignment: any } }>(`/api/v1/master/orders/${orderId.value}`)
    assignment.value = res.data.assignment
    finalPriceInput.value = order.value?.final_price_amount ? String(order.value.final_price_amount) : ''
  }
  catch (error: unknown) {
    const code = (error as { data?: { error?: { code?: string } } })?.data?.error?.code
    const statusCode = (error as { statusCode?: number })?.statusCode
    if (code === 'auth.session_expired' || statusCode === 401) {
      try {
        await tryTelegramAuth()
        const res = await $fetch<{ data: { assignment: any } }>(`/api/v1/master/orders/${orderId.value}`)
        assignment.value = res.data.assignment
        finalPriceInput.value = order.value?.final_price_amount ? String(order.value.final_price_amount) : ''
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

const finalPriceAmount = computed(() => {
  const amount = Number(String(finalPriceInput.value || '').trim())
  return Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : null
})

const commissionPreview = computed(() => {
  if (!finalPriceAmount.value) return null
  return Math.ceil((finalPriceAmount.value * Number(order.value?.commission_percent || 5)) / 100)
})

const canEditFinalPrice = computed(() =>
  !!order.value
  && order.value.status !== 'completed'
  && order.value.status !== 'canceled_admin'
  && order.value.commission_status !== 'paid'
)

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    accepted: 'Қабул қилинган',
    in_progress: 'Жараёнда',
    completed: 'Иш якунланган',
    canceled_admin: 'Бекор қилинган'
  }
  return map[status] || status
}

const commissionStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    not_set: 'Сумма киритилмаган',
    unpaid: 'Админга тўлов кутилаяпти',
    paid: 'Админ қабул қилди',
    waived: 'Комиссия кечирилган'
  }
  return map[status] || status
}

const submitFinalPrice = async () => {
  if (!finalPriceAmount.value) {
    errorMessage.value = 'Иш суммасини киритинг.'
    return
  }

  savingPrice.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await $fetch(`/api/v1/master/orders/${orderId.value}/price`, {
      method: 'POST',
      body: { final_price_amount: finalPriceAmount.value }
    })
    successMessage.value = 'Сумма сақланди. 5% админ улуши автоматик ҳисобланди.'
    await loadOrder()
    successMessage.value = 'Сумма сақланди. 5% админ улуши автоматик ҳисобланди.'
  }
  catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  }
  finally {
    savingPrice.value = false
  }
}

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
            <span class="rounded-full bg-[#eee9ff] px-2 py-1 text-xs font-semibold text-[#5c4bd6]">{{ statusLabel(order.status) }}</span>
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
          <UFormField label="Бажарилган иш суммаси">
            <UInput
              v-model="finalPriceInput"
              type="number"
              min="1"
              inputmode="numeric"
              placeholder="Масалан: 200000"
              class="w-full"
              :disabled="!canEditFinalPrice"
            />
          </UFormField>
          <div class="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
            <p>Фоиз: {{ order.commission_percent }}%</p>
            <p>Админ улуши: <span class="font-bold">{{ commissionPreview ? `${commissionPreview} сўм` : order.commission_amount ? `${order.commission_amount} сўм` : '-' }}</span></p>
            <p>Ҳолат: <span class="font-bold">{{ commissionStatusLabel(order.commission_status) }}</span></p>
            <p v-if="order.completed_at" class="text-emerald-700">Иш якунланган: {{ new Date(order.completed_at).toLocaleString() }}</p>
          </div>
          <p v-if="successMessage" class="text-sm font-semibold text-emerald-700">{{ successMessage }}</p>
          <UButton
            v-if="canEditFinalPrice"
            color="primary"
            class="w-full justify-center font-semibold"
            :loading="savingPrice"
            :disabled="!finalPriceAmount"
            @click="submitFinalPrice"
          >
            Суммани сақлаш
          </UButton>
          <p v-else class="text-xs text-slate-500">
            Админ қабул қилганидан кейин сумма ўзгартирилмайди.
          </p>
        </section>
      </template>
    </main>
  </div>
</template>
