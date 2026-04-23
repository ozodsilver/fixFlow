<script setup lang="ts">
import type { IntakeReply, ServiceRequest } from '~/types/requester'

const route = useRoute()
const requestId = computed(() => String(route.params.requestId || ''))

const api = useRequesterApi()
const { t } = useAppI18n()

const loading = ref(true)
const sending = ref(false)
const requestState = ref<ServiceRequest | null>(null)
const errorMessage = ref('')
const missingFields = ref<string[]>([])
const readyForDispatch = ref(false)
const lastIntent = ref<IntakeReply['intent']>('collect')

interface LocalMessage {
  id: string
  role: 'user' | 'ai' | 'system'
  text: string
  time: string
}

const messages = ref<LocalMessage[]>([])

const requiredFieldMap: Record<string, string> = {
  service_domain: t('fields.service_domain'),
  issue_type: t('fields.issue_type'),
  problem_summary: t('fields.problem_summary'),
  phone: t('fields.phone'),
  address: t('fields.address'),
  landmark: t('fields.landmark'),
  urgency: t('fields.urgency'),
  visit_time: t('fields.visit_time'),
  consent: t('fields.consent')
}

const resolveMissingLabel = (field: string) => requiredFieldMap[field] ?? field

const addMessage = (role: 'user' | 'ai' | 'system', text: string) => {
  messages.value.push({
    id: crypto.randomUUID(),
    role,
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
}

const loadRequest = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await api.getRequest(requestId.value)
    requestState.value = result.data

    if (messages.value.length === 0) {
      addMessage('system', t('requester.chatHint'))
    }
  }
  catch (error: unknown) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
  }
  finally {
    loading.value = false
  }
}

const sendMessage = async (text: string) => {
  if (!requestState.value) return

  addMessage('user', text)
  sending.value = true

  try {
    const result = await api.postIntakeMessage(requestId.value, {
      text,
      idempotency_key: crypto.randomUUID()
    })

    const intake = result.data
    lastIntent.value = intake.intent
    readyForDispatch.value = intake.ready_for_dispatch
    missingFields.value = intake.missing_required
    requestState.value = intake.request

    addMessage('ai', intake.ai_reply)
  }
  catch (error: unknown) {
    addMessage('system', t('common.unexpectedError'))
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
  }
  finally {
    sending.value = false
  }
}

const confirmIntake = async () => {
  try {
    const response = await api.confirmIntake(requestId.value)
    missingFields.value = response.data.missing_required
    readyForDispatch.value = response.data.status === 'ready_for_dispatch'

    await loadRequest()
  }
  catch (error: unknown) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
  }
}

const dispatchRequest = async () => {
  try {
    await api.dispatchRequest(requestId.value, crypto.randomUUID())
    await navigateTo(`/requester/requests/${requestId.value}/status`)
  }
  catch (error: unknown) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
  }
}

onMounted(loadRequest)
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50">
    <AppHeader :title="t('requester.chatTitle')" :subtitle="requestState?.public_code || ''" logo-text="FF" />

    <main class="flex-1 space-y-3 overflow-y-auto px-4 py-4">
      <LoadingState v-if="loading" :label="t('common.loading')" />

      <ErrorState
        v-else-if="errorMessage && !requestState"
        :title="t('common.unexpectedError')"
        :message="errorMessage"
        :retry-label="t('common.retry')"
        @retry="loadRequest"
      />

      <template v-else>
        <RequestSummaryCard
          v-if="requestState"
          :title="t('requester.summaryTitle')"
          :request="requestState"
        />

        <IntakeProgressHint
          v-if="missingFields.length > 0"
          :missing-fields="missingFields"
          :title="t('requester.missingTitle')"
          :resolve-label="resolveMissingLabel"
        />

        <div v-if="lastIntent === 'offtopic'" class="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {{ t('requester.offtopicRefusal') }}
        </div>

        <div v-if="readyForDispatch" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {{ t('requester.readyToDispatch') }}
        </div>

        <section class="space-y-2">
          <ChatMessageBubble
            v-for="message in messages"
            :key="message.id"
            :role="message.role"
            :text="message.text"
            :time="message.time"
          />
        </section>
      </template>
    </main>

    <section class="border-t border-slate-200 bg-white px-4 py-3">
      <div class="mx-auto flex w-full max-w-md gap-2">
        <UButton class="flex-1" variant="soft" color="neutral" @click="confirmIntake">
          {{ t('requester.confirmIntake') }}
        </UButton>
        <UButton class="flex-1" :disabled="!readyForDispatch" @click="dispatchRequest">
          {{ t('requester.dispatch') }}
        </UButton>
      </div>
    </section>

    <ChatComposer :placeholder="t('requester.composerPlaceholder')" :send-label="t('common.send')" :loading="sending" @send="sendMessage" />
  </div>
</template>
