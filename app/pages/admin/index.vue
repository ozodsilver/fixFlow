<script setup lang="ts">
const loggedIn = ref(false)
const loading = ref(true)
const actionLoadingId = ref<string | null>(null)
const errorMessage = ref('')

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

const pendingItems = ref<CancelItem[]>([])
const historyItems = ref<CancelItem[]>([])

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
    const res = await $fetch<{ data: { pending: CancelItem[]; history: CancelItem[] } }>('/api/v1/admin/cancel-requests')
    pendingItems.value = res.data.pending || []
    historyItems.value = res.data.history || []
  }
  catch (error: unknown) {
    errorMessage.value = (error as { data?: { error?: { message?: string } } })?.data?.error?.message || 'Failed to load'
  }
  finally {
    loading.value = false
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
  <div class="ff-shell min-h-dvh px-4 py-4">
    <AppHeader title="Admin Panel" subtitle="Cancel Requests" logo-text="AD" :show-back-button="true" back-to="/" />

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
          <h2 class="ff-section-title">Pending Cancel Requests</h2>
          <UButton color="neutral" variant="soft" @click="logout">Chiqish</UButton>
        </div>

        <LoadingState v-if="loading" label="Yuklanmoqda..." />

        <section v-if="!loading && pendingItems.length === 0" class="ff-panel rounded-3xl p-4">
          <p class="text-sm text-slate-600">Pending so'rovlar hozircha yo'q.</p>
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
              Bekor qilishni tasdiqlash
            </UButton>
            <UButton
              color="neutral"
              variant="soft"
              :loading="actionLoadingId === item.id"
              @click="review(item.id, 'reject')"
            >
              Rad etish
            </UButton>
          </div>
        </section>

        <div class="pt-2">
          <h2 class="ff-section-title">Cancel History</h2>
        </div>

        <section v-if="!loading && historyItems.length === 0" class="ff-panel rounded-3xl p-4">
          <p class="text-sm text-slate-600">History hozircha yo'q.</p>
        </section>

        <section v-for="item in historyItems" :key="`history-${item.id}`" class="ff-panel rounded-3xl p-4 space-y-2">
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-bold">{{ item.service_requests?.public_code }}</p>
            <span
              class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
              :class="item.status === 'approved' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'"
            >
              {{ item.status === 'approved' ? "Bekor qilingan" : "Rad etilgan" }}
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

      <ErrorState
        v-if="errorMessage"
        title="Xato"
        :message="errorMessage"
      />
    </main>
  </div>
</template>
