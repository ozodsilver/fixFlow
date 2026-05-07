<script setup lang="ts">
const { t, locale } = useAppI18n()
const api = useRequesterApi()

const loading = ref(true)
const errorMessage = ref('')
const assignments = ref<any[]>([])
const dispatches = ref<any[]>([])
const dispatchesLoading = ref(false)
const activeTab = ref<'dispatches' | 'orders'>('dispatches')
const newDispatchIds = ref<Set<string>>(new Set())
let pollTimer: ReturnType<typeof setInterval> | null = null

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

const loadDispatches = async (silent = false) => {
  if (!silent) dispatchesLoading.value = true
  try {
    const res = await $fetch<{ data: { items: any[] } }>('/api/v1/master/dispatches')
    const incoming = res.data.items || []
    const prevIds = new Set(dispatches.value.map((d: any) => d.id))
    const fresh = new Set<string>()
    for (const d of incoming) {
      if (!prevIds.has(d.id)) fresh.add(d.id)
    }
    if (fresh.size > 0) {
      newDispatchIds.value = fresh
      setTimeout(() => { newDispatchIds.value = new Set() }, 4000)
    }
    dispatches.value = incoming
  }
  catch {
    // silent — polling failures shouldn't disrupt UI
  }
  finally {
    if (!silent) dispatchesLoading.value = false
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

const orderStatusLabel = (status: string) => ({
  accepted: 'Қабул қилинган',
  in_progress: 'Жараёнда',
  completed: 'Иш якунланган',
  canceled_admin: 'Бекор қилинган'
} as Record<string, string>)[status] ?? status

const commissionStatusLabel = (status: string) => ({
  not_set: 'сумма киритилмаган',
  unpaid: 'админга тўлов кутилаяпти',
  paid: 'админ қабул қилди',
  waived: 'комиссия кечирилган'
} as Record<string, string>)[status] ?? status

const urgencyLabel = (urgency: string) => ({
  low: 'Шошилмайди',
  normal: 'Одатий',
  high: 'Шошилинч',
  emergency: 'Жуда шошилинч'
} as Record<string, string>)[urgency] ?? urgency

const urgencyColor = (urgency: string) => ({
  low: 'bg-slate-100 text-slate-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  emergency: 'bg-rose-100 text-rose-700'
} as Record<string, string>)[urgency] ?? 'bg-slate-100 text-slate-600'

const expiresInLabel = (expiresAt: string | null) => {
  if (!expiresAt) return ''
  const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
  if (diff <= 0) return 'Муддати ўтган'
  const m = Math.floor(diff / 60)
  const s = diff % 60
  return m > 0 ? `${m} дақ ${s} сон` : `${s} сон`
}

const activeOrderCount = computed(() =>
  assignments.value.filter((a: any) => {
    const st = orderOf(a)?.status
    return st === 'accepted' || st === 'in_progress'
  }).length
)

onMounted(async () => {
  await Promise.all([loadOrders(), loadDispatches()])
  pollTimer = setInterval(() => loadDispatches(true), 15000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div class="ff-shell min-h-dvh px-4 py-4 pb-28">
    <AppHeader title="Master" subtitle="Буюртмалар" logo-text="MS" :show-back-button="true" back-to="/" />

    <main class="mt-4 space-y-3">
      <ErrorState v-if="errorMessage" :title="t('common.unexpectedError')" :message="errorMessage" :retry-label="t('common.retry')" @retry="loadOrders" />

      <template v-else>
        <!-- Yangi buyurtmalar tab -->
        <template v-if="activeTab === 'dispatches'">
          <div class="flex items-center justify-between">
            <p class="text-xs text-slate-500">Ҳар 15 сонияда янгиланади</p>
            <button type="button" class="text-xs font-semibold text-[#7358e8]" @click="loadDispatches(false)">
              Янгилаш
            </button>
          </div>

          <LoadingState v-if="dispatchesLoading" :label="t('common.loading')" />

          <section v-else-if="dispatches.length === 0" class="ff-panel rounded-3xl p-4">
            <p class="text-sm text-slate-600">Ҳозирча очиқ буюртмалар йўқ.</p>
          </section>

          <section
            v-for="d in dispatches"
            v-else
            :key="d.id"
            class="ff-panel rounded-3xl p-4 space-y-2 cursor-pointer transition-all"
            :class="newDispatchIds.has(d.id) ? 'ring-2 ring-[#7358e8] ring-offset-1' : ''"
            @click="navigateTo(`/master/dispatches/${d.id}`)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <span v-if="newDispatchIds.has(d.id)" class="inline-block size-2 rounded-full bg-[#7358e8] animate-pulse" />
                <p class="text-sm font-bold">{{ d.request?.public_code || '-' }}</p>
              </div>
              <span
                v-if="d.request?.urgency"
                class="rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="urgencyColor(d.request.urgency)"
              >
                {{ urgencyLabel(d.request.urgency) }}
              </span>
            </div>
            <p class="text-sm text-slate-700">{{ d.request?.problem_summary || '-' }}</p>
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span>
                Вақт:
                {{
                  d.request?.visit_time_at
                    ? new Date(d.request.visit_time_at).toLocaleString()
                    : d.request?.visit_time_mode === 'asap' ? 'Имкон бўлгач' : '-'
                }}
              </span>
              <span class="font-medium text-amber-600">{{ expiresInLabel(d.expires_at) }}</span>
            </div>
          </section>
        </template>

        <!-- Mening buyurtmalarim tab -->
        <template v-else>
          <LoadingState v-if="loading" :label="t('common.loading')" />

          <section v-else-if="assignments.length === 0" class="ff-panel rounded-3xl p-4">
            <p class="text-sm text-slate-600">Ҳозирча сизга бириктирилган буюртмалар йўқ.</p>
          </section>

          <section
            v-for="assignment in assignments"
            v-else
            :key="assignment.id"
            class="ff-panel rounded-3xl p-4 space-y-2 cursor-pointer"
            @click="navigateTo(`/master/orders/${orderOf(assignment)?.id}`)"
          >
            <div class="flex items-start justify-between gap-3">
              <p class="text-sm font-bold">{{ requestOf(assignment)?.public_code }}</p>
              <span class="rounded-full bg-[#eee9ff] px-2 py-1 text-xs font-semibold text-[#5c4bd6]">
                {{ orderStatusLabel(orderOf(assignment)?.status) }}
              </span>
            </div>
            <p class="text-sm text-slate-700">{{ requestOf(assignment)?.problem_summary || '-' }}</p>
            <p class="text-xs text-slate-500">Олинган вақт: {{ assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleString() : '-' }}</p>
            <p class="text-xs text-slate-500">
              Визит вақти: {{ requestOf(assignment)?.visit_time_at ? new Date(requestOf(assignment)?.visit_time_at).toLocaleString() : requestOf(assignment)?.visit_time_mode || '-' }}
            </p>
            <p class="text-xs text-slate-500">
              Комиссия:
              {{ orderOf(assignment)?.commission_amount ? `${orderOf(assignment)?.commission_amount} сўм` : '-' }}
              · {{ commissionStatusLabel(orderOf(assignment)?.commission_status) }}
            </p>
          </section>
        </template>
      </template>
    </main>

    <!-- Bottom tab bar -->
    <footer class="fixed inset-x-0 bottom-0 z-20 border-t border-white/70 bg-[#eef6f2]/95 px-4 py-3 shadow-[0_-10px_30px_rgba(28,75,61,0.12)] backdrop-blur">
      <div class="mx-auto grid max-w-md grid-cols-2 gap-2">
        <button
          type="button"
          class="flex min-h-14 items-center justify-center gap-1.5 rounded-2xl px-2 text-sm font-bold transition"
          :class="activeTab === 'dispatches' ? 'bg-[#7358e8] text-white shadow-[0_8px_20px_rgba(115,88,232,0.28)]' : 'bg-white/80 text-[#4f665d]'"
          @click="activeTab = 'dispatches'"
        >
          <UIcon name="i-lucide-bell" class="size-4" />
          <span>Янги</span>
          <span
            v-if="dispatches.length > 0"
            class="rounded-full px-2 py-0.5 text-xs"
            :class="activeTab === 'dispatches' ? 'bg-white/20' : 'bg-[#e5eee9]'"
          >
            {{ dispatches.length }}
          </span>
        </button>
        <button
          type="button"
          class="flex min-h-14 items-center justify-center gap-2 rounded-2xl px-2 text-sm font-bold transition"
          :class="activeTab === 'orders' ? 'bg-[#7358e8] text-white shadow-[0_8px_20px_rgba(115,88,232,0.28)]' : 'bg-white/80 text-[#4f665d]'"
          @click="activeTab = 'orders'"
        >
          <UIcon name="i-lucide-clipboard-list" class="size-4" />
          <span>Буюртмаларим</span>
          <span
            v-if="activeOrderCount > 0"
            class="rounded-full px-2 py-0.5 text-xs"
            :class="activeTab === 'orders' ? 'bg-white/20' : 'bg-[#e5eee9]'"
          >
            {{ activeOrderCount }}
          </span>
        </button>
      </div>
    </footer>
  </div>
</template>
