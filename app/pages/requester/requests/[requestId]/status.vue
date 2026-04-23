<script setup lang="ts">
import type { RequestStatus, ServiceRequest } from '~/types/requester'

const api = useRequesterApi()
const route = useRoute()
const { t } = useAppI18n()

const loading = ref(true)
const refreshing = ref(false)
const cancelling = ref(false)
const request = ref<ServiceRequest | null>(null)
const errorMessage = ref('')

const requestId = computed(() => String(route.params.requestId || ''))

const cancellableStatuses: RequestStatus[] = ['draft', 'intake_in_progress', 'ready_for_dispatch', 'dispatched']
const cancellableStatusSet = new Set<RequestStatus>(cancellableStatuses)

const canCancel = computed(() => {
  if (!request.value || cancelling.value) return false
  return cancellableStatusSet.has(request.value.status)
})

const canContinueIntake = computed(() => {
  if (!request.value) return false
  return request.value.status === 'draft' || request.value.status === 'intake_in_progress' || request.value.status === 'ready_for_dispatch'
})

const summaryLabels = computed(() => ({
  id: t('requester.summaryId'),
  status: t('requester.summaryStatus'),
  summary: t('requester.summaryProblem'),
  address: t('requester.summaryAddress')
}))

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

const load = async (silent = false) => {
  if (silent) {
    refreshing.value = true
  }
  else {
    loading.value = true
  }
  errorMessage.value = ''

  try {
    const result = await api.getRequest(requestId.value)
    request.value = result.data
  }
  catch (error: unknown) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
  }
  finally {
    loading.value = false
    refreshing.value = false
  }
}

const cancelRequest = async () => {
  if (!request.value || !canCancel.value) return

  cancelling.value = true
  errorMessage.value = ''

  try {
    const result = await api.cancelRequest(request.value.id)
    request.value = {
      ...request.value,
      status: result.data.status
    }
  }
  catch (error: unknown) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
  }
  finally {
    cancelling.value = false
  }
}

let pollTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await load()

  pollTimer = setInterval(() => {
    void load(true)
  }, 12000)
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div class="ff-shell min-h-dvh">
    <AppHeader :title="t('requester.statusTitle')" :subtitle="t('common.status')" logo-text="FF" />

    <main class="space-y-4 px-4 py-4">
      <LoadingState v-if="loading" :label="t('requester.loadingRequest')" />

      <ErrorState
        v-else-if="!request && errorMessage"
        :title="t('common.unexpectedError')"
        :message="errorMessage"
        :retry-label="t('common.retry')"
        @retry="load()"
      />

      <template v-else-if="request">
        <section class="ff-panel ff-rise rounded-2xl p-4">
          <p class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ t('common.status') }}</p>
          <div class="mt-2 flex items-center justify-between gap-3">
            <p class="text-sm font-bold tracking-tight text-slate-900">{{ request.public_code }}</p>
            <span class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
              {{ statusLabel(request.status) }}
            </span>
          </div>
        </section>

        <RequestSummaryCard :title="t('requester.summaryTitle')" :request="request" :labels="summaryLabels" />

        <ErrorState
          v-if="errorMessage"
          :title="t('common.unexpectedError')"
          :message="errorMessage"
          :retry-label="t('common.retry')"
          @retry="load()"
        />

        <section class="ff-panel ff-rise rounded-2xl p-3">
          <div class="flex flex-wrap gap-2">
            <UButton color="neutral" variant="soft" :loading="refreshing" @click="load(true)">
              {{ t('common.refresh') }}
            </UButton>
            <UButton
              v-if="canContinueIntake"
              color="primary"
              variant="soft"
              @click="navigateTo(`/requester/requests/${request.id}/intake`)"
            >
              {{ t('requester.continueIntake') }}
            </UButton>
            <UButton v-if="canCancel" color="error" variant="soft" :loading="cancelling" @click="cancelRequest">
              {{ t('requester.cancelRequest') }}
            </UButton>
          </div>
          <p v-if="!canCancel" class="mt-2 text-xs text-slate-600">
            {{ t('requester.cancelBlocked') }}
          </p>
        </section>
      </template>
    </main>
  </div>
</template>
