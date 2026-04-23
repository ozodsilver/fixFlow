<script setup lang="ts">
import type {
  IntakeIntent,
  IntakeMessage,
  RequiredFieldKey,
  RequestStatus,
  ServiceDomain,
  ServiceRequest
} from '~/types/requester'

interface ChatLine {
  id: string
  role: 'user' | 'ai' | 'system'
  text: string
  at: string
}

const api = useRequesterApi()
const route = useRoute()
const { t, locale } = useAppI18n()

const loading = ref(true)
const sending = ref(false)
const confirming = ref(false)
const dispatching = ref(false)

const request = ref<ServiceRequest | null>(null)
const domainName = ref('')
const messages = ref<ChatLine[]>([])
const missingRequired = ref<RequiredFieldKey[]>([])
const readyForDispatch = ref(false)
const lastIntent = ref<IntakeIntent | null>(null)
const errorMessage = ref('')

const requestId = computed(() => String(route.params.requestId || ''))

const intakeWritableStatuses: RequestStatus[] = ['draft', 'intake_in_progress', 'ready_for_dispatch']
const intakeWritableStatusSet = new Set<RequestStatus>(intakeWritableStatuses)

const canUseChat = computed(() => {
  if (!request.value) return false
  return intakeWritableStatusSet.has(request.value.status)
})

const canConfirm = computed(() => {
  if (!request.value || confirming.value || dispatching.value) return false
  return readyForDispatch.value && request.value.status !== 'dispatched'
})

const canDispatch = computed(() => {
  if (!request.value || dispatching.value) return false
  return request.value.status === 'ready_for_dispatch'
})

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

const summaryLabels = computed(() => ({
  id: t('requester.summaryId'),
  status: t('requester.summaryStatus'),
  summary: t('requester.summaryProblem'),
  address: t('requester.summaryAddress')
}))

const resolveFieldLabel = (field: RequiredFieldKey) => t(`fields.${field}`)

const makeIdempotencyKey = () => {
  if (process.client && typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const pushMessage = (role: ChatLine['role'], text: string) => {
  messages.value.push({
    id: makeIdempotencyKey(),
    role,
    text,
    at: new Date().toISOString()
  })
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(locale.value === 'ru' ? 'ru-RU' : 'uz-Cyrl-UZ', {
    hour: '2-digit',
    minute: '2-digit'
  })

const loadDomain = async (domainId: number) => {
  try {
    const domains = await api.getServiceDomains()
    const selected = domains.data.find((item: ServiceDomain) => item.id === domainId)
    if (!selected) {
      domainName.value = `#${domainId}`
      return
    }

    domainName.value = locale.value === 'ru' ? selected.name_ru : selected.name_uz_cyrl
  }
  catch {
    domainName.value = `#${domainId}`
  }
}

const syncFromRequest = (value: ServiceRequest) => {
  request.value = value
  readyForDispatch.value = value.status === 'ready_for_dispatch'
  if (value.status === 'ready_for_dispatch') {
    missingRequired.value = []
  }
}

const hydrateFromHistory = (history: IntakeMessage[]) => {
  if (history.length === 0) {
    messages.value = []
    lastIntent.value = null
    if (!readyForDispatch.value) {
      missingRequired.value = []
    }
    return
  }

  messages.value = history.map((item) => ({
    id: String(item.id),
    role: item.sender,
    text: item.message_text,
    at: item.created_at
  }))

  const latestWithSnapshot = [...history].reverse().find((item) => !!item.validation_snapshot)
  if (!latestWithSnapshot?.validation_snapshot) {
    return
  }

  const snapshot = latestWithSnapshot.validation_snapshot
  if (snapshot.intent) {
    lastIntent.value = snapshot.intent
  }

  if (snapshot.ready_for_dispatch === true || request.value?.status === 'ready_for_dispatch') {
    readyForDispatch.value = true
    missingRequired.value = []
    return
  }

  if (Array.isArray(snapshot.missing_required)) {
    missingRequired.value = snapshot.missing_required
  }
}

const loadIntakeHistory = async () => {
  if (!request.value) return

  const historyRes = await api.getIntakeMessages(request.value.id)
  hydrateFromHistory(historyRes.data.items)

  if (messages.value.length === 0) {
    pushMessage('ai', t('requester.chatNoMessages'))
  }
}

const loadRequest = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await api.getRequest(requestId.value)
    syncFromRequest(result.data)
    await loadDomain(result.data.domain_id)
    await loadIntakeHistory()
  }
  catch (error: unknown) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
  }
  finally {
    loading.value = false
  }
}

const submitMessage = async (text: string) => {
  if (!request.value || !canUseChat.value) return

  sending.value = true
  errorMessage.value = ''
  const optimisticId = makeIdempotencyKey()
  messages.value.push({
    id: optimisticId,
    role: 'user',
    text,
    at: new Date().toISOString()
  })

  try {
    const result = await api.postIntakeMessage(request.value.id, {
      text,
      idempotency_key: makeIdempotencyKey()
    })

    syncFromRequest(result.data.request)
    missingRequired.value = result.data.missing_required
    readyForDispatch.value = result.data.ready_for_dispatch
    lastIntent.value = result.data.intent
    pushMessage('ai', result.data.ai_reply)
  }
  catch (error: unknown) {
    messages.value = messages.value.filter(item => item.id !== optimisticId)
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
  }
  finally {
    sending.value = false
  }
}

const confirmIntake = async () => {
  if (!request.value || !canConfirm.value) return

  confirming.value = true
  errorMessage.value = ''

  try {
    const result = await api.confirmIntake(request.value.id)
    request.value = {
      ...request.value,
      status: result.data.status
    }
    readyForDispatch.value = true
    missingRequired.value = []
    lastIntent.value = 'confirm'
    pushMessage('system', t('requester.confirmedIntake'))
  }
  catch (error: unknown) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
  }
  finally {
    confirming.value = false
  }
}

const dispatch = async () => {
  if (!request.value || !canDispatch.value) return

  dispatching.value = true
  errorMessage.value = ''

  try {
    await api.dispatchRequest(request.value.id, makeIdempotencyKey())
    await navigateTo(`/requester/requests/${request.value.id}/status`)
  }
  catch (error: unknown) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
  }
  finally {
    dispatching.value = false
  }
}

onMounted(loadRequest)
</script>

<template>
  <div class="ff-shell flex min-h-dvh flex-col">
    <AppHeader :title="t('requester.chatTitle')" :subtitle="t('requester.chatHint')" logo-text="FF" />

    <main class="flex-1 space-y-4 px-4 py-4">
      <LoadingState v-if="loading" :label="t('requester.loadingRequest')" />

      <ErrorState
        v-else-if="!request && errorMessage"
        :title="t('common.unexpectedError')"
        :message="errorMessage"
        :retry-label="t('common.retry')"
        @retry="loadRequest"
      />

      <template v-else-if="request">
        <section class="ff-panel-soft ff-rise rounded-2xl p-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('requester.domainLabel') }}</p>
              <p class="mt-1 truncate text-sm font-bold tracking-tight text-slate-900">{{ domainName }}</p>
            </div>
            <span class="ff-status-chip shrink-0" :class="statusToneClass(request.status)">
              {{ statusLabel(request.status) }}
            </span>
          </div>
        </section>

        <RequestSummaryCard
          :title="t('requester.summaryTitle')"
          :request="request"
          :labels="summaryLabels"
          :status-text="statusLabel(request.status)"
          :status-class="statusToneClass(request.status)"
        />

        <IntakeProgressHint
          v-if="missingRequired.length > 0"
          :title="t('requester.missingTitle')"
          :missing-fields="missingRequired"
          :resolve-label="resolveFieldLabel"
        />

        <section v-if="readyForDispatch" class="ff-rise rounded-2xl border border-emerald-200 bg-emerald-50/95 p-3">
          <p class="text-sm font-bold text-emerald-800">{{ t('requester.readyToDispatch') }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <UButton :loading="confirming" :disabled="!canConfirm" color="neutral" variant="soft" class="font-semibold" @click="confirmIntake">
              {{ t('requester.confirmIntake') }}
            </UButton>
            <UButton :loading="dispatching" :disabled="!canDispatch" color="primary" class="font-semibold" @click="dispatch">
              {{ t('requester.dispatch') }}
            </UButton>
            <UButton color="neutral" variant="ghost" class="font-semibold" @click="navigateTo(`/requester/requests/${request.id}/status`)">
              {{ t('requester.goStatus') }}
            </UButton>
          </div>
        </section>

        <ErrorState
          v-if="errorMessage"
          :title="t('common.unexpectedError')"
          :message="errorMessage"
          :retry-label="t('common.retry')"
          @retry="loadRequest"
        />

        <section class="ff-panel rounded-2xl p-3">
          <p class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ t('requester.chatTitle') }}</p>

          <div class="ff-scroll mt-2 max-h-[46dvh] min-h-40 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-2.5">
            <ChatMessageBubble
              v-for="line in messages"
              :key="line.id"
              :role="line.role === 'system' ? 'ai' : line.role"
              :text="line.text"
              :time="formatTime(line.at)"
            />
          </div>
        </section>
      </template>
    </main>

    <ChatComposer
      :placeholder="canUseChat ? t('requester.composerPlaceholder') : t('requester.composerDisabled')"
      :send-label="t('common.send')"
      :loading="sending"
      :disabled="!canUseChat"
      @send="submitMessage"
    />
  </div>
</template>
