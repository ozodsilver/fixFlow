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
const noticeMessage = ref('')

const requestId = computed(() => String(route.params.requestId || ''))

const cancellableStatuses: RequestStatus[] = ['draft', 'intake_in_progress', 'ready_for_dispatch', 'dispatched', 'in_fulfillment']
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

const statusToneClass = (status: RequestStatus) => {
  if (status === 'draft' || status === 'intake_in_progress') return 'bg-amber-100 text-amber-800'
  if (status === 'ready_for_dispatch' || status === 'dispatched') return 'bg-sky-100 text-sky-800'
  if (status === 'in_fulfillment') return 'bg-emerald-100 text-emerald-800'
  if (status === 'closed_completed') return 'bg-teal-100 text-teal-800'
  if (status === 'closed_canceled_user' || status === 'closed_canceled_admin') return 'bg-rose-100 text-rose-800'
  return 'bg-slate-100 text-slate-700'
}

const statusStep = (status: RequestStatus) => {
  if (status === 'draft' || status === 'intake_in_progress') return 1
  if (status === 'ready_for_dispatch' || status === 'dispatched') return 2
  if (status === 'in_fulfillment') return 3
  return 4
}

const load = async (silent = false) => {
  if (silent) {
    refreshing.value = true
  }
  else {
    loading.value = true
  }
  errorMessage.value = ''
  noticeMessage.value = ''

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
  noticeMessage.value = ''

  try {
    const result = await api.cancelRequest(request.value.id)
    request.value = {
      ...request.value,
      status: result.data.status
    }
    if (result.data.admin_review_required) {
      noticeMessage.value = t('requester.cancelSentToAdmin')
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

onMounted(async () => {
  await load()
})
</script>

<template>
  <div class="ff-shell min-h-dvh">
    <AppHeader
      :title="t('requester.statusTitle')"
      :subtitle="t('common.status')"
      logo-text="FF"
      :show-back-button="true"
      back-to="/requester"
    />

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
        <section class="ff-panel-soft ff-rise rounded-3xl p-4">
          <p class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ t('common.status') }}</p>
          <div class="mt-2 flex items-center justify-between gap-3">
            <p class="text-sm font-bold tracking-tight text-slate-900">{{ request.public_code }}</p>
            <span class="ff-status-chip" :class="statusToneClass(request.status)">
              {{ statusLabel(request.status) }}
            </span>
          </div>
          <div class="mt-3 grid grid-cols-4 gap-1.5">
            <div
              v-for="n in 4"
              :key="n"
              class="h-1.5 rounded-full"
              :class="n <= statusStep(request.status) ? 'bg-emerald-500' : 'bg-slate-200'"
            />
          </div>
        </section>

        <RequestSummaryCard
          :title="t('requester.summaryTitle')"
          :request="request"
          :labels="summaryLabels"
          :status-text="statusLabel(request.status)"
          :status-class="statusToneClass(request.status)"
        />

        <ErrorState
          v-if="errorMessage"
          :title="t('common.unexpectedError')"
          :message="errorMessage"
          :retry-label="t('common.retry')"
          @retry="load()"
        />
        <section v-if="noticeMessage" class="ff-panel-soft rounded-2xl border border-sky-200 p-3">
          <p class="text-sm font-medium text-sky-800">
            {{ noticeMessage }}
          </p>
        </section>

        <section class="ff-panel ff-rise rounded-3xl p-3">
          <div class="flex flex-wrap gap-2">
            <UButton color="neutral" variant="soft" class="font-semibold" :loading="refreshing" @click="load(true)">
              {{ t('common.refresh') }}
            </UButton>
            <UButton
              v-if="canContinueIntake"
              color="primary"
              variant="soft"
              class="font-semibold"
              @click="navigateTo(`/requester/requests/${request.id}/intake`)"
            >
              {{ t('requester.continueIntake') }}
            </UButton>
            <UButton v-if="canCancel" color="error" variant="soft" class="font-semibold" :loading="cancelling" @click="cancelRequest">
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
