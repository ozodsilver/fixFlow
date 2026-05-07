<script setup lang="ts">
const api = useRequesterApi()
const { locale } = useAppI18n()

const loggedIn = ref(false)
const loading = ref(true)
const actionLoadingId = ref<string | null>(null)
const errorMessage = ref('')
const activeSection = ref<'dispatch' | 'orders' | 'masters' | 'cancel'>('dispatch')
const telegramAdminLoading = ref(false)
const telegramLoginAttempted = ref(false)

const login = ref('')
const password = ref('')

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

const waitForTelegramInitData = async () => {
  for (let i = 0; i < 20; i += 1) {
    const value = getTelegramInitData()
    if (value) return value
    await new Promise(resolve => setTimeout(resolve, 120))
  }
  return null
}

type CancelItem = {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  reason_text: string | null
  created_at: string
  reviewed_at?: string | null
  service_requests?: {
    public_code?: string
    problem_summary?: string | null
    phone_e164?: string | null
  } | null
  users?: {
    display_name?: string | null
    phone_e164?: string | null
  } | null
}

type DispatchReviewItem = {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at?: string | null
  service_requests?: {
    public_code?: string
    status?: string
    problem_summary?: string | null
    phone_e164?: string | null
    address_text?: string | null
    urgency?: string | null
    visit_time_mode?: string | null
    visit_time_at?: string | null
  } | null
  users?: {
    display_name?: string | null
    phone_e164?: string | null
    telegram_user_id?: number
  } | null
}

type AdminOrderItem = {
  id: string
  status: 'accepted' | 'in_progress' | 'completed' | 'canceled_admin'
  final_price_amount?: number | null
  commission_percent: number
  commission_amount?: number | null
  commission_status: 'not_set' | 'unpaid' | 'paid' | 'waived'
  commission_paid_at?: string | null
  admin_note?: string | null
  completed_at?: string | null
  created_at: string
  service_requests?: {
    public_code?: string
    problem_summary?: string | null
    phone_e164?: string | null
    address_text?: string | null
    users?: {
      display_name?: string | null
      phone_e164?: string | null
      telegram_user_id?: number
    } | null
  } | null
  order_assignments?: Array<{
    id: string
    status: string
    is_current: boolean
    users?: {
      display_name?: string | null
      phone_e164?: string | null
      telegram_user_id?: number
    } | null
  }>
}

type MasterItem = {
  id: string
  telegram_user_id: number
  display_name: string
  username?: string | null
  phone_e164?: string | null
  locale: string
  is_blocked: boolean
  last_seen_at?: string | null
  created_at: string
  master_profiles?: {
    approval_status: 'pending' | 'approved' | 'revoked'
    is_active: boolean
    approved_at?: string | null
    revoked_at?: string | null
    created_at: string
    updated_at: string
  } | null
}

const pendingDispatchItems = ref<DispatchReviewItem[]>([])
const dispatchHistoryItems = ref<DispatchReviewItem[]>([])
const pendingItems = ref<CancelItem[]>([])
const historyItems = ref<CancelItem[]>([])
const orderItems = ref<AdminOrderItem[]>([])
const orderDrafts = ref<Record<string, { final_price_amount: string; admin_note: string }>>({})
const masterItems = ref<MasterItem[]>([])

const activeSubtitle = computed(() =>
  activeSection.value === 'dispatch'
    ? 'Актив'
    : activeSection.value === 'orders'
      ? 'Буюртмалар'
      : activeSection.value === 'masters'
        ? 'Усталар'
        : 'Бекор қилинган'
)

const unpaidCommissionTotal = computed(() =>
  orderItems.value.reduce((total, item) => (
    item.commission_status === 'unpaid' ? total + Number(item.commission_amount || 0) : total
  ), 0)
)

const checkSession = async () => {
  try {
    await $fetch('/api/v1/admin/auth/me')
    loggedIn.value = true
  }
  catch {
    loggedIn.value = false
  }
}

const loadItems = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const [dispatchRes, cancelRes, ordersRes, mastersRes] = await Promise.all([
      $fetch<{ data: { pending: DispatchReviewItem[]; history: DispatchReviewItem[] } }>('/api/v1/admin/dispatch-reviews'),
      $fetch<{ data: { pending: CancelItem[]; history: CancelItem[] } }>('/api/v1/admin/cancel-requests'),
      $fetch<{ data: { items: AdminOrderItem[] } }>('/api/v1/admin/orders'),
      $fetch<{ data: { items: MasterItem[] } }>('/api/v1/admin/masters')
    ])
    pendingDispatchItems.value = dispatchRes.data.pending || []
    dispatchHistoryItems.value = dispatchRes.data.history || []
    pendingItems.value = cancelRes.data.pending || []
    historyItems.value = cancelRes.data.history || []
    orderItems.value = ordersRes.data.items || []
    masterItems.value = mastersRes.data.items || []
    orderDrafts.value = Object.fromEntries(orderItems.value.map((item) => [
      item.id,
      {
        final_price_amount: item.final_price_amount ? String(item.final_price_amount) : '',
        admin_note: item.admin_note || ''
      }
    ]))
  }
  catch (error: unknown) {
    errorMessage.value = (error as { data?: { error?: { message?: string } } })?.data?.error?.message || 'Failed to load'
  }
  finally {
    loading.value = false
  }
}

const currentAssignment = (item: AdminOrderItem) =>
  item.order_assignments?.find(assignment => assignment.is_current) || item.order_assignments?.[0] || null

const normalizeRelated = <T>(value: T | T[] | null | undefined): T | null =>
  Array.isArray(value) ? (value[0] || null) : (value || null)

const requestOfOrder = (item: AdminOrderItem) => normalizeRelated(item.service_requests)
const requesterOfOrder = (item: AdminOrderItem) => normalizeRelated(requestOfOrder(item)?.users)
const masterOfOrder = (item: AdminOrderItem) => normalizeRelated(currentAssignment(item)?.users)
const masterProfileOf = (item: MasterItem) => normalizeRelated(item.master_profiles)
const masterStatusOf = (item: MasterItem) => masterProfileOf(item)?.approval_status || 'not_master'
const pendingMastersCount = computed(() =>
  masterItems.value.filter(item => masterStatusOf(item) === 'pending' || masterStatusOf(item) === 'not_master').length
)

const orderStatusLabel = (status: string) => ({
  accepted: 'Қабул қилинган',
  in_progress: 'Жараёнда',
  completed: 'Якунланган',
  canceled_admin: 'Бекор қилинган'
} as Record<string, string>)[status] ?? status

const commissionStatusLabel = (status: string) => ({
  not_set: 'Белгиланмаган',
  unpaid: 'Тўланмаган',
  paid: 'Тўланган',
  waived: 'Тушириб қолдирилган'
} as Record<string, string>)[status] ?? status

const masterStatusLabel = (status: string) => ({
  approved: 'Тасдиқланган',
  pending: 'Кутилмоқда',
  revoked: 'Блокланган',
  not_master: 'Уста эмас'
} as Record<string, string>)[status] ?? status
const orderDraftAmountText = (item: AdminOrderItem) => {
  const raw = orderDrafts.value[item.id]?.final_price_amount
  if (raw === null || raw === undefined) return ''
  return String(raw).trim()
}
const orderDraftOf = (item: AdminOrderItem) => {
  if (!orderDrafts.value[item.id]) {
    orderDrafts.value[item.id] = {
      final_price_amount: item.final_price_amount ? String(item.final_price_amount) : '',
      admin_note: item.admin_note || ''
    }
  }
  return orderDrafts.value[item.id] as { final_price_amount: string; admin_note: string }
}
const setOrderDraftField = (item: AdminOrderItem, field: 'final_price_amount' | 'admin_note', value: string | number | null | undefined) => {
  const draft = orderDraftOf(item)
  draft[field] = String(value || '')
}
const orderDraftFinalPrice = (item: AdminOrderItem) => orderDraftOf(item).final_price_amount
const orderDraftAdminNote = (item: AdminOrderItem) => orderDraftOf(item).admin_note
const draftFinalPriceOf = (item: AdminOrderItem) => {
  const raw = orderDraftAmountText(item)
  if (!raw) return item.final_price_amount || null
  const amount = Number(raw)
  return Number.isFinite(amount) && amount >= 0 ? Math.floor(amount) : null
}
const commissionPreviewOf = (item: AdminOrderItem) => {
  const amount = draftFinalPriceOf(item)
  if (amount === null) return item.commission_amount || null
  return Math.ceil((amount * Number(item.commission_percent || 5)) / 100)
}

const updateOrder = async (item: AdminOrderItem, extra: Record<string, unknown> = {}) => {
  actionLoadingId.value = item.id
  errorMessage.value = ''
  const draft = orderDrafts.value[item.id] || { final_price_amount: '', admin_note: '' }
  const amountText = draft.final_price_amount === null || draft.final_price_amount === undefined ? '' : String(draft.final_price_amount).trim()
  const amount = amountText ? Number(amountText) : null

  try {
    await $fetch(`/api/v1/admin/orders/${item.id}/update`, {
      method: 'POST',
      body: {
        final_price_amount: amount,
        admin_note: draft.admin_note,
        ...extra
      }
    })
    await loadItems()
  }
  catch (error: unknown) {
    errorMessage.value = (error as { data?: { error?: { message?: string } } })?.data?.error?.message || 'Order update failed'
  }
  finally {
    actionLoadingId.value = null
  }
}

const updateMasterStatus = async (item: MasterItem, status: 'pending' | 'approved' | 'revoked') => {
  actionLoadingId.value = item.id
  errorMessage.value = ''
  try {
    await $fetch(`/api/v1/admin/masters/${item.id}/status`, {
      method: 'POST',
      body: { status }
    })
    await loadItems()
  }
  catch (error: unknown) {
    errorMessage.value = (error as { data?: { error?: { message?: string } } })?.data?.error?.message || 'Master update failed'
  }
  finally {
    actionLoadingId.value = null
  }
}

const submitLogin = async () => {
  errorMessage.value = ''
  try {
    await $fetch('/api/v1/admin/auth/login', {
      method: 'POST',
      body: { login: login.value.trim(), password: password.value }
    })
    loggedIn.value = true
    await loadItems()
  }
  catch (error: unknown) {
    errorMessage.value = (error as { data?: { error?: { message?: string } } })?.data?.error?.message || 'Login failed'
  }
}

const submitTelegramAdminLogin = async (silent = false) => {
  if (telegramAdminLoading.value) return false
  telegramAdminLoading.value = true
  if (!silent) errorMessage.value = ''

  try {
    const initData = await waitForTelegramInitData()
    if (!initData) {
      if (!silent) errorMessage.value = 'Telegram Mini App маълумоти топилмади.'
      return false
    }

    sessionStorage.setItem('ff_tg_init_data', initData)
    await api.initAuth({
      init_data: initData,
      locale: locale.value
    })
    await $fetch('/api/v1/admin/auth/telegram', { method: 'POST' })
    loggedIn.value = true
    await loadItems()
    return true
  }
  catch (error: unknown) {
    if (!silent) {
      errorMessage.value =
        (error as { data?: { error?: { message?: string } } })?.data?.error?.message || 'Telegram admin login failed'
    }
    return false
  }
  finally {
    telegramAdminLoading.value = false
  }
}

const reviewDispatch = async (id: string, action: 'approve' | 'reject') => {
  actionLoadingId.value = id
  errorMessage.value = ''
  try {
    await $fetch(`/api/v1/admin/dispatch-reviews/${id}/review`, {
      method: 'POST',
      body: { action }
    })
    await loadItems()
  }
  catch (error: unknown) {
    errorMessage.value = (error as { data?: { error?: { message?: string } } })?.data?.error?.message || 'Review failed'
  }
  finally {
    actionLoadingId.value = null
  }
}

const review = async (id: string, action: 'approve' | 'reject') => {
  actionLoadingId.value = id
  errorMessage.value = ''
  try {
    await $fetch(`/api/v1/admin/cancel-requests/${id}/review`, {
      method: 'POST',
      body: { action }
    })
    await loadItems()
  }
  catch (error: unknown) {
    errorMessage.value = (error as { data?: { error?: { message?: string } } })?.data?.error?.message || 'Review failed'
  }
  finally {
    actionLoadingId.value = null
  }
}

const logout = async () => {
  await $fetch('/api/v1/admin/auth/logout', { method: 'POST' })
  loggedIn.value = false
}

onMounted(async () => {
  await checkSession()
  if (loggedIn.value) {
    await loadItems()
    return
  }

  telegramLoginAttempted.value = true
  const telegramLoggedIn = await submitTelegramAdminLogin(true)
  if (!telegramLoggedIn) loading.value = false
})
</script>

<template>
  <div class="ff-shell min-h-dvh px-4 py-4" :class="loggedIn ? 'pb-28' : ''">
    <AppHeader title="Admin Panel" :subtitle="activeSubtitle" logo-text="AD" :show-back-button="true" back-to="/" />

    <main class="mt-4 space-y-4">
      <section v-if="!loggedIn" class="ff-panel rounded-3xl p-4 space-y-3">
        <UFormField label="Login" required>
          <UInput v-model="login" placeholder="admin" class="w-full" />
        </UFormField>
        <UFormField label="Password" required>
          <UInput v-model="password" type="password" placeholder="••••••••" class="w-full" />
        </UFormField>
        <div class="flex flex-wrap gap-2">
          <UButton color="primary" class="font-semibold" @click="submitLogin">Kirish</UButton>
          <UButton
            color="neutral"
            variant="soft"
            class="font-semibold"
            :loading="telegramAdminLoading"
            @click="submitTelegramAdminLogin(false)"
          >
            Telegram орқали кириш
          </UButton>
        </div>
        <p v-if="telegramLoginAttempted" class="text-xs text-slate-500">
          Mini App ичида очилса, admin Telegram аккаунт автоматик текширилади.
        </p>
      </section>

      <template v-else>
        <div class="flex items-center justify-between">
          <h2 class="ff-section-title">
            {{
              activeSection === 'dispatch'
                ? 'Усталарга юбориш кутилаётган мурожаатлар'
                : activeSection === 'orders'
                  ? 'Буюртмалар ва комиссия'
                  : activeSection === 'masters'
                    ? 'Усталарни тасдиқлаш'
                    : 'Бекор қилиш кутилаётган сўровлар'
            }}
          </h2>
          <UButton color="neutral" variant="soft" @click="logout">Chiqish</UButton>
        </div>

        <LoadingState v-if="loading" label="Yuklanmoqda..." />

        <template v-if="activeSection === 'dispatch'">
          <section v-if="!loading && pendingDispatchItems.length === 0" class="ff-panel rounded-3xl p-4">
            <p class="text-sm text-slate-600">Усталарга юбориш кутилаётган мурожаатлар ҳозирча йўқ.</p>
          </section>

          <section v-for="item in pendingDispatchItems" :key="item.id" class="ff-panel rounded-3xl p-4 space-y-2">
            <p class="text-sm font-bold">{{ item.service_requests?.public_code }}</p>
            <p class="text-xs text-slate-600">Mijoz: {{ item.users?.display_name || '-' }}</p>
            <p class="text-xs text-slate-600">Telefon: {{ item.users?.phone_e164 || item.service_requests?.phone_e164 || '-' }}</p>
            <p class="text-xs text-slate-600">Manzil: {{ item.service_requests?.address_text || '-' }}</p>
            <p class="text-xs text-slate-600">Muammo: {{ item.service_requests?.problem_summary || '-' }}</p>
            <p class="text-xs text-slate-500">
              Tushgan vaqt: {{ new Date(item.created_at).toLocaleString() }}
            </p>
            <div class="flex gap-2 pt-1">
              <UButton
                color="primary"
                variant="soft"
                :loading="actionLoadingId === item.id"
                @click="reviewDispatch(item.id, 'approve')"
              >
                Усталарга юбориш
              </UButton>
              <UButton
                color="neutral"
                variant="soft"
                :loading="actionLoadingId === item.id"
                @click="reviewDispatch(item.id, 'reject')"
              >
                Рад этиш
              </UButton>
            </div>
          </section>

          <div class="pt-2">
            <h2 class="ff-section-title">Юборилган мурожаатлар тарихи</h2>
          </div>

          <section v-if="!loading && dispatchHistoryItems.length === 0" class="ff-panel rounded-3xl p-4">
            <p class="text-sm text-slate-600">Юборилган мурожаатлар тарихи ҳозирча йўқ.</p>
          </section>

          <section v-for="item in dispatchHistoryItems" :key="`dispatch-history-${item.id}`" class="ff-panel rounded-3xl p-4 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-bold">{{ item.service_requests?.public_code }}</p>
              <span
                class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                :class="item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'"
              >
                {{ item.status === 'approved' ? "Усталарга юборилган" : "Рад этилган" }}
              </span>
            </div>
            <p class="text-xs text-slate-600">Mijoz: {{ item.users?.display_name || '-' }}</p>
            <p class="text-xs text-slate-600">Telefon: {{ item.users?.phone_e164 || item.service_requests?.phone_e164 || '-' }}</p>
            <p class="text-xs text-slate-600">Muammo: {{ item.service_requests?.problem_summary || '-' }}</p>
            <p v-if="item.reviewed_at" class="text-xs text-slate-500">
              Ko'rib chiqilgan: {{ new Date(item.reviewed_at).toLocaleString() }}
            </p>
          </section>
        </template>

        <template v-else-if="activeSection === 'orders'">
          <section class="ff-panel rounded-3xl p-4">
            <p class="text-xs font-bold uppercase tracking-wide text-violet-700">Умумий назорат</p>
            <p class="mt-1 text-sm text-slate-700">Тўланмаган комиссия: <span class="font-bold">{{ unpaidCommissionTotal }} сўм</span></p>
          </section>

          <section v-if="!loading && orderItems.length === 0" class="ff-panel rounded-3xl p-4">
            <p class="text-sm text-slate-600">Ҳозирча қабул қилинган буюртмалар йўқ.</p>
          </section>

          <section v-for="item in orderItems" :key="`order-${item.id}`" class="ff-panel rounded-3xl p-4 space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="text-sm font-bold">{{ requestOfOrder(item)?.public_code || '-' }}</p>
                <p class="mt-1 text-xs text-slate-500">Ҳолат: {{ orderStatusLabel(item.status) }}</p>
              </div>
              <span
                class="rounded-full px-2 py-1 text-xs font-semibold"
                :class="item.commission_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : item.commission_status === 'unpaid' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'"
              >
                {{ commissionStatusLabel(item.commission_status) }}
              </span>
            </div>

            <div class="space-y-1 text-xs text-slate-600">
              <p>Mijoz: {{ requesterOfOrder(item)?.display_name || '-' }} · {{ requestOfOrder(item)?.phone_e164 || requesterOfOrder(item)?.phone_e164 || '-' }}</p>
              <p>Master: {{ masterOfOrder(item)?.display_name || '-' }} · {{ masterOfOrder(item)?.phone_e164 || '-' }}</p>
              <p>Manzil: {{ requestOfOrder(item)?.address_text || '-' }}</p>
              <p>Muammo: {{ requestOfOrder(item)?.problem_summary || '-' }}</p>
              <p>Qabul qilingan: {{ new Date(item.created_at).toLocaleString() }}</p>
            </div>

            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <UFormField label="Ish summasi (master kiritgan)">
                <UInput
                  :model-value="orderDraftFinalPrice(item)"
                  type="number"
                  min="0"
                  placeholder="Masalan: 200000"
                  class="w-full"
                  @update:model-value="setOrderDraftField(item, 'final_price_amount', $event)"
                />
              </UFormField>
              <UFormField label="Admin izohi">
                <UInput
                  :model-value="orderDraftAdminNote(item)"
                  placeholder="Ixtiyoriy"
                  class="w-full"
                  @update:model-value="setOrderDraftField(item, 'admin_note', $event)"
                />
              </UFormField>
            </div>

            <div class="rounded-2xl bg-slate-50 p-3 text-xs text-slate-700">
              <p>Комиссия: {{ item.commission_percent }}%</p>
              <p>Админ улуши: <span class="font-bold">{{ commissionPreviewOf(item) ? `${commissionPreviewOf(item)} сўм` : '-' }}</span></p>
              <p v-if="commissionPreviewOf(item) && commissionPreviewOf(item) !== item.commission_amount" class="mt-1 text-[11px] text-amber-700">
                Бу ҳали preview. DBга ёзиш учун “Сақлаш”ни босинг.
              </p>
              <p v-if="item.commission_paid_at">Тўланган вақт: {{ new Date(item.commission_paid_at).toLocaleString() }}</p>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                color="primary"
                variant="soft"
                :loading="actionLoadingId === item.id"
                @click="updateOrder(item)"
              >
                Сақлаш
              </UButton>
              <UButton
                color="success"
                variant="soft"
                :loading="actionLoadingId === item.id"
                :disabled="!draftFinalPriceOf(item) || item.status === 'completed'"
                @click="updateOrder(item, { commission_status: 'paid', status: 'completed' })"
              >
                Қабул қилинди
              </UButton>
            </div>
          </section>
        </template>

        <template v-else-if="activeSection === 'masters'">
          <section class="ff-panel rounded-3xl p-4">
            <p class="text-xs font-bold uppercase tracking-wide text-violet-700">Master ruxsatlari</p>
            <p class="mt-1 text-sm text-slate-700">
              Янги ёки pending усталар: <span class="font-bold">{{ pendingMastersCount }}</span>
            </p>
          </section>

          <section v-if="!loading && masterItems.length === 0" class="ff-panel rounded-3xl p-4">
            <p class="text-sm text-slate-600">Ҳозирча Telegram орқали кирган userлар йўқ.</p>
          </section>

          <section v-for="item in masterItems" :key="`master-${item.id}`" class="ff-panel rounded-3xl p-4 space-y-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-bold">{{ item.display_name }}</p>
                <p class="text-xs text-slate-500">@{{ item.username || '-' }} · TG {{ item.telegram_user_id }}</p>
              </div>
              <span
                class="shrink-0 rounded-full px-2 py-1 text-xs font-semibold"
                :class="masterStatusOf(item) === 'approved' ? 'bg-emerald-100 text-emerald-700' : masterStatusOf(item) === 'revoked' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'"
              >
                {{ masterStatusLabel(masterStatusOf(item)) }}
              </span>
            </div>

            <div class="space-y-1 text-xs text-slate-600">
              <p>Telefon: {{ item.phone_e164 || '-' }}</p>
              <p>Oxirgi kirgan: {{ item.last_seen_at ? new Date(item.last_seen_at).toLocaleString() : '-' }}</p>
              <p v-if="masterProfileOf(item)?.approved_at">Tasdiqlangan: {{ new Date(masterProfileOf(item)?.approved_at || '').toLocaleString() }}</p>
              <p v-if="masterProfileOf(item)?.revoked_at">Bekor qilingan: {{ new Date(masterProfileOf(item)?.revoked_at || '').toLocaleString() }}</p>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                color="success"
                variant="soft"
                :loading="actionLoadingId === item.id"
                :disabled="masterStatusOf(item) === 'approved'"
                @click="updateMasterStatus(item, 'approved')"
              >
                Тасдиқлаш
              </UButton>
              <UButton
                color="neutral"
                variant="soft"
                :loading="actionLoadingId === item.id"
                :disabled="masterStatusOf(item) === 'pending'"
                @click="updateMasterStatus(item, 'pending')"
              >
                Кутилмоқда
              </UButton>
              <UButton
                color="error"
                variant="soft"
                :loading="actionLoadingId === item.id"
                :disabled="masterStatusOf(item) === 'revoked'"
                @click="updateMasterStatus(item, 'revoked')"
              >
                Блоклаш
              </UButton>
            </div>
          </section>
        </template>

        <template v-else>
          <section v-if="!loading && pendingItems.length === 0" class="ff-panel rounded-3xl p-4">
            <p class="text-sm text-slate-600">Бекор қилиш кутилаётган сўровлар ҳозирча йўқ.</p>
          </section>

          <section v-for="item in pendingItems" :key="item.id" class="ff-panel rounded-3xl p-4 space-y-2">
            <p class="text-sm font-bold">{{ item.service_requests?.public_code }}</p>
            <p class="text-xs text-slate-600">Mijoz: {{ item.users?.display_name }}</p>
            <p class="text-xs text-slate-600">Telefon: {{ item.users?.phone_e164 || item.service_requests?.phone_e164 || '-' }}</p>
            <p class="text-xs text-slate-600">Muammo: {{ item.service_requests?.problem_summary || '-' }}</p>
            <div class="flex gap-2 pt-1">
              <UButton
                color="error"
                variant="soft"
                :loading="actionLoadingId === item.id"
                @click="review(item.id, 'approve')"
              >
                Бекор қилишни тасдиқлаш
              </UButton>
              <UButton
                color="neutral"
                variant="soft"
                :loading="actionLoadingId === item.id"
                @click="review(item.id, 'reject')"
              >
                Рад этиш
              </UButton>
            </div>
          </section>

          <div class="pt-2">
            <h2 class="ff-section-title">Бекор қилиш сўровлари тарихи</h2>
          </div>

          <section v-if="!loading && historyItems.length === 0" class="ff-panel rounded-3xl p-4">
            <p class="text-sm text-slate-600">Бекор қилиш тарихи ҳозирча йўқ.</p>
          </section>

          <section v-for="item in historyItems" :key="`history-${item.id}`" class="ff-panel rounded-3xl p-4 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-bold">{{ item.service_requests?.public_code }}</p>
              <span
                class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                :class="item.status === 'approved' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'"
              >
                {{ item.status === 'approved' ? "Бекор қилинган" : "Рад этилган" }}
              </span>
            </div>
            <p class="text-xs text-slate-600">Mijoz: {{ item.users?.display_name || '-' }}</p>
            <p class="text-xs text-slate-600">Telefon: {{ item.users?.phone_e164 || item.service_requests?.phone_e164 || '-' }}</p>
            <p class="text-xs text-slate-600">Muammo: {{ item.service_requests?.problem_summary || '-' }}</p>
            <p class="text-xs text-slate-500">
              So'rov vaqti: {{ new Date(item.created_at).toLocaleString() }}
            </p>
            <p v-if="item.reviewed_at" class="text-xs text-slate-500">
              Ko'rib chiqilgan: {{ new Date(item.reviewed_at).toLocaleString() }}
            </p>
          </section>
        </template>
      </template>

      <ErrorState
        v-if="errorMessage"
        title="Xato"
        :message="errorMessage"
      />
    </main>

    <footer v-if="loggedIn" class="fixed inset-x-0 bottom-0 z-20 border-t border-white/70 bg-[#eef6f2]/95 px-4 py-3 shadow-[0_-10px_30px_rgba(28,75,61,0.12)] backdrop-blur">
      <div class="mx-auto grid max-w-md grid-cols-4 gap-2">
        <button
          type="button"
          class="flex min-h-14 items-center justify-center gap-1.5 rounded-2xl px-2 text-sm font-bold transition"
          :class="activeSection === 'dispatch' ? 'bg-[#7358e8] text-white shadow-[0_8px_20px_rgba(115,88,232,0.28)]' : 'bg-white/80 text-[#4f665d]'"
          @click="activeSection = 'dispatch'"
        >
          <UIcon name="i-lucide-send" class="size-4" />
          <span>Актив</span>
          <span class="rounded-full px-2 py-0.5 text-xs" :class="activeSection === 'dispatch' ? 'bg-white/20' : 'bg-[#e5eee9]'">
            {{ pendingDispatchItems.length }}
          </span>
        </button>
        <button
          type="button"
          class="flex min-h-14 items-center justify-center gap-2 rounded-2xl px-2 text-sm font-bold transition"
          :class="activeSection === 'orders' ? 'bg-[#7358e8] text-white shadow-[0_8px_20px_rgba(115,88,232,0.28)]' : 'bg-white/80 text-[#4f665d]'"
          @click="activeSection = 'orders'"
        >
          <UIcon name="i-lucide-clipboard-list" class="size-4" />
          <span>Ордер</span>
          <span class="rounded-full px-2 py-0.5 text-xs" :class="activeSection === 'orders' ? 'bg-white/20' : 'bg-[#e5eee9]'">
            {{ orderItems.length }}
          </span>
        </button>
        <button
          type="button"
          class="flex min-h-14 items-center justify-center gap-1.5 rounded-2xl px-2 text-sm font-bold transition"
          :class="activeSection === 'masters' ? 'bg-[#7358e8] text-white shadow-[0_8px_20px_rgba(115,88,232,0.28)]' : 'bg-white/80 text-[#4f665d]'"
          @click="activeSection = 'masters'"
        >
          <UIcon name="i-lucide-user-check" class="size-4" />
          <span>Уста</span>
          <span class="rounded-full px-2 py-0.5 text-xs" :class="activeSection === 'masters' ? 'bg-white/20' : 'bg-[#e5eee9]'">
            {{ pendingMastersCount }}
          </span>
        </button>
        <button
          type="button"
          class="flex min-h-14 items-center justify-center gap-1.5 rounded-2xl px-2 text-sm font-bold transition"
          :class="activeSection === 'cancel' ? 'bg-[#7358e8] text-white shadow-[0_8px_20px_rgba(115,88,232,0.28)]' : 'bg-white/80 text-[#4f665d]'"
          @click="activeSection = 'cancel'"
        >
          <UIcon name="i-lucide-ban" class="size-4" />
          <span>Бекор</span>
          <span class="rounded-full px-2 py-0.5 text-xs" :class="activeSection === 'cancel' ? 'bg-white/20' : 'bg-[#e5eee9]'">
            {{ pendingItems.length }}
          </span>
        </button>
      </div>
    </footer>
  </div>
</template>
