<script setup lang="ts">
const loggedIn = ref(false)
const loading = ref(true)
const actionLoadingId = ref<string | null>(null)
const errorMessage = ref('')
const activeSection = ref<'dispatch' | 'orders' | 'cancel'>('dispatch')

const login = ref('')
const password = ref('')

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

const pendingDispatchItems = ref<DispatchReviewItem[]>([])
const dispatchHistoryItems = ref<DispatchReviewItem[]>([])
const pendingItems = ref<CancelItem[]>([])
const historyItems = ref<CancelItem[]>([])
const orderItems = ref<AdminOrderItem[]>([])
const orderDrafts = ref<Record<string, { final_price_amount: string; admin_note: string }>>({})

const activeSubtitle = computed(() =>
  activeSection.value === 'dispatch' ? 'Актив' : activeSection.value === 'orders' ? 'Буюртмалар' : 'Бекор қилинган'
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
    const [dispatchRes, cancelRes, ordersRes] = await Promise.all([
      $fetch<{ data: { pending: DispatchReviewItem[]; history: DispatchReviewItem[] } }>('/api/v1/admin/dispatch-reviews'),
      $fetch<{ data: { pending: CancelItem[]; history: CancelItem[] } }>('/api/v1/admin/cancel-requests'),
      $fetch<{ data: { items: AdminOrderItem[] } }>('/api/v1/admin/orders')
    ])
    pendingDispatchItems.value = dispatchRes.data.pending || []
    dispatchHistoryItems.value = dispatchRes.data.history || []
    pendingItems.value = cancelRes.data.pending || []
    historyItems.value = cancelRes.data.history || []
    orderItems.value = ordersRes.data.items || []
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

const updateOrder = async (item: AdminOrderItem, extra: Record<string, unknown> = {}) => {
  actionLoadingId.value = item.id
  errorMessage.value = ''
  const draft = orderDrafts.value[item.id] || { final_price_amount: '', admin_note: '' }
  const amount = draft.final_price_amount.trim() ? Number(draft.final_price_amount) : null

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
  if (loggedIn.value) await loadItems()
  else loading.value = false
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
        <UButton color="primary" class="font-semibold" @click="submitLogin">Kirish</UButton>
      </section>

      <template v-else>
        <div class="flex items-center justify-between">
          <h2 class="ff-section-title">
            {{ activeSection === 'dispatch' ? 'Усталарга юбориш кутилаётган мурожаатлар' : activeSection === 'orders' ? 'Буюртмалар ва комиссия' : 'Бекор қилиш кутилаётган сўровлар' }}
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
                <p class="mt-1 text-xs text-slate-500">Status: {{ item.status }}</p>
              </div>
              <span
                class="rounded-full px-2 py-1 text-xs font-semibold"
                :class="item.commission_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : item.commission_status === 'unpaid' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'"
              >
                {{ item.commission_status }}
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
              <UFormField label="Ish summasi">
                <UInput
                  v-model="orderDrafts[item.id].final_price_amount"
                  type="number"
                  min="0"
                  placeholder="Masalan: 200000"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Admin izohi">
                <UInput
                  v-model="orderDrafts[item.id].admin_note"
                  placeholder="Ixtiyoriy"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="rounded-2xl bg-slate-50 p-3 text-xs text-slate-700">
              <p>Комиссия: {{ item.commission_percent }}%</p>
              <p>Админ улуши: <span class="font-bold">{{ item.commission_amount ? `${item.commission_amount} сўм` : '-' }}</span></p>
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
                @click="updateOrder(item, { commission_status: 'paid' })"
              >
                Комиссия тўланди
              </UButton>
              <UButton
                color="neutral"
                variant="soft"
                :loading="actionLoadingId === item.id"
                :disabled="item.status === 'completed'"
                @click="updateOrder(item, { status: 'completed' })"
              >
                Иш якунланди
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
      <div class="mx-auto grid max-w-md grid-cols-3 gap-2">
        <button
          type="button"
          class="flex min-h-14 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-bold transition"
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
          class="flex min-h-14 items-center justify-center gap-2 rounded-2xl px-2 text-sm font-bold transition"
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
