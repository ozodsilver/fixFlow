<script setup lang="ts">
const route = useRoute()
const { t, locale } = useAppI18n()
const api = useRequesterApi()

const loading = ref(true)
const claiming = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const dispatch = ref<{
  id: string
  status: string
  expires_at: string | null
  claimed_by_master_id: string | null
  is_claimed_by_current_master: boolean
  master_has_active_order: boolean
  request: {
    public_code: string
    issue_custom: string | null
    problem_summary: string | null
    phone_e164: string | null
    address_text: string | null
    landmark_text: string | null
    urgency: string | null
    visit_time_mode: string | null
    visit_time_at: string | null
  }
} | null>(null)

const canClaim = computed(() => dispatch.value?.status === 'open' && !dispatch.value?.master_has_active_order)
const isClaimed = computed(() => dispatch.value?.status === 'claimed')
const isClaimedByMe = computed(() => !!dispatch.value?.is_claimed_by_current_master)
const isClaimedByOther = computed(() => isClaimed.value && !isClaimedByMe.value)

const dispatchId = computed(() => String(route.params.dispatchId || ''))

const getErrorMessage = (error: unknown) => {
  const code = (error as { data?: { error?: { code?: string } } })?.data?.error?.code
  if (code === 'master.not_approved') return t('master.notApproved')
  if (code === 'master.has_active_order') return t('master.hasActiveOrder')
  return (error as { data?: { error?: { message?: string }, message?: string }, message?: string })?.data?.error?.message
    || (error as { data?: { message?: string } })?.data?.message
    || (error as { message?: string })?.message
    || t('common.unexpectedError')
}

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
  const webApp = (window as Window & { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp
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
  for (let i = 0; i < 20; i += 1) {
    const value = getTelegramInitData()
    if (value) return value
    await new Promise(resolve => setTimeout(resolve, 120))
  }
  return null
}

const tryTelegramAuth = async () => {
  const runtimeConfig = useRuntimeConfig()
  const initData = await waitForTelegramInitData()

  if (initData) {
    sessionStorage.setItem('ff_tg_init_data', initData)
    await api.initAuth({
      init_data: initData,
      locale: locale.value
    })
    return
  }

  if (runtimeConfig.public.allowDevAuthBypass) {
    const devTelegramUserId = Number(sessionStorage.getItem('ff_dev_tg_uid') || '900001')
    sessionStorage.setItem('ff_dev_tg_uid', String(devTelegramUserId))
    await api.initAuth({
      telegram_user_id: devTelegramUserId,
      display_name: 'Dev Local User',
      locale: locale.value
    })
    return
  }
}

const loadDispatch = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await $fetch<{ data: { dispatch: any } }>(`/api/v1/master/dispatches/${dispatchId.value}`)
    dispatch.value = res.data.dispatch
  }
  catch (error: unknown) {
    const code = (error as { data?: { error?: { code?: string } } })?.data?.error?.code
    const statusCode = (error as { statusCode?: number })?.statusCode

    if (code === 'auth.session_expired' || statusCode === 401) {
      try {
        await tryTelegramAuth()
        const res = await $fetch<{ data: { dispatch: any } }>(`/api/v1/master/dispatches/${dispatchId.value}`)
        dispatch.value = res.data.dispatch
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

const claimDispatch = async () => {
  if (!dispatch.value) return
  claiming.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const result = await $fetch<{ data: { order_id: string } }>(`/api/v1/master/dispatches/${dispatchId.value}/claim`, {
      method: 'POST',
      body: {
        idempotency_key: crypto.randomUUID()
      }
    })
    successMessage.value = 'Buyurtma qabul qilindi.'
    await loadDispatch()
    if (result.data.order_id) {
      await navigateTo(`/master/orders/${result.data.order_id}`)
    }
  }
  catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  }
  finally {
    claiming.value = false
  }
}

onMounted(loadDispatch)
</script>

<template>
  <div class="ff-shell min-h-dvh px-4 py-4">
    <AppHeader title="Master Dispatch" subtitle="Buyurtma preview" logo-text="FF" :show-back-button="true" back-to="/" />

    <main class="mt-4 space-y-3">
      <LoadingState v-if="loading" :label="t('common.loading')" />
      <ErrorState v-else-if="errorMessage" :title="t('common.unexpectedError')" :message="errorMessage" :retry-label="t('common.retry')" @retry="loadDispatch" />

      <template v-else-if="dispatch">
        <section class="ff-panel rounded-3xl p-4">
          <p class="text-sm font-bold">{{ dispatch.request.public_code }}</p>
          <p class="mt-1 text-sm text-slate-700">{{ dispatch.request.problem_summary || '-' }}</p>
          <p class="mt-1 text-xs text-slate-500">{{ t('master.dispatchStatus') }}: {{ t(`master.status_${dispatch.status}`) }}</p>
          <p class="mt-1 text-xs text-slate-500">{{ t('master.phone') }}: {{ dispatch.request.phone_e164 || t('master.hiddenUntilClaim') }}</p>
          <p class="mt-1 text-xs text-slate-500">{{ t('master.address') }}: {{ dispatch.request.address_text || t('master.hiddenUntilClaim') }}</p>
        </section>

        <UButton
          color="primary"
          class="w-full justify-center font-semibold"
          :loading="claiming"
          :disabled="!canClaim"
          @click="claimDispatch"
        >
          Буюртмани қабул қилиш
        </UButton>

        <div v-if="dispatch.master_has_active_order" class="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {{ t('master.hasActiveOrder') }}
        </div>

        <p v-if="successMessage || isClaimedByMe" class="text-sm font-semibold text-emerald-700">
          {{ successMessage || 'Buyurtma qabul qilindi.' }}
        </p>
        <p v-if="isClaimedByOther" class="text-sm font-semibold text-rose-700">Bu buyurtma boshqa masterga berildi.</p>
      </template>
    </main>
  </div>
</template>
