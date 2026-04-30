<script setup lang="ts">
import type { RequestStatus, ServiceDomain, ServiceRequest } from '~/types/requester'

const api = useRequesterApi()
const route = useRoute()
const { t, locale } = useAppI18n()

const loading = ref(true)
const savingAddress = ref(false)
const submittingStructured = ref(false)
const errorMessage = ref('')

const request = ref<ServiceRequest | null>(null)
const domainName = ref('')
const requesterName = ref('')
const draftAddress = ref<{ address_text: string; address_lat: number; address_lng: number } | null>(null)

const phoneInput = ref('')
const visitTimeInput = ref('')
const problemSummaryInput = ref('')

const requestId = computed(() => String(route.params.requestId || ''))

const intakeWritableStatuses: RequestStatus[] = ['draft', 'intake_in_progress', 'ready_for_dispatch']
const intakeWritableStatusSet = new Set<RequestStatus>(intakeWritableStatuses)

const canFillForm = computed(() => {
  if (!request.value) return false
  return intakeWritableStatusSet.has(request.value.status)
})

const greetingText = computed(() => {
  const name = requesterName.value ? `, ${requesterName.value}` : ''
  if (locale.value === 'ru') return `Здравствуйте${name}. Пожалуйста, заполните форму с вашими данными.`
  return `Салом${name}. Илтимос, маълумотларингизни формага киритинг.`
})

const submitDisabled = computed(() => {
  if (!request.value || !canFillForm.value) return true
  if (!phoneInput.value.trim() || !visitTimeInput.value.trim() || !problemSummaryInput.value.trim()) return true
  const hasSavedAddress =
    !!request.value.address_text && request.value.address_lat !== null && request.value.address_lng !== null
  const hasDraftAddress = !!draftAddress.value?.address_text
  if (!hasSavedAddress && !hasDraftAddress) return true
  return submittingStructured.value
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

const loadDomain = async (domainId: number) => {
  try {
    const domains = await api.getServiceDomains()
    const selected = domains.data.find((item: ServiceDomain) => item.id === domainId)
    domainName.value = selected ? (locale.value === 'ru' ? selected.name_ru : selected.name_uz_cyrl) : `#${domainId}`
  }
  catch {
    domainName.value = `#${domainId}`
  }
}

const loadRequesterName = async () => {
  try {
    const bootstrap = await api.bootstrap()
    requesterName.value = bootstrap.data.user.display_name?.trim() || ''
  }
  catch {
    requesterName.value = ''
  }
}

const syncFromRequest = (value: ServiceRequest) => {
  request.value = value
  if (value.phone_e164 && !phoneInput.value) phoneInput.value = value.phone_e164
  if (value.visit_time_at && !visitTimeInput.value) {
    const dt = new Date(value.visit_time_at)
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    visitTimeInput.value = local
  }
  if (value.problem_summary && !problemSummaryInput.value) problemSummaryInput.value = value.problem_summary
}

const loadRequest = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await api.getRequest(requestId.value)
    syncFromRequest(result.data)
    await Promise.all([loadDomain(result.data.domain_id), loadRequesterName()])
  }
  catch (error: unknown) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
  }
  finally {
    loading.value = false
  }
}

const saveAddressFromMap = async (payload: { address_text: string; address_lat: number; address_lng: number }) => {
  if (!request.value) return
  savingAddress.value = true
  errorMessage.value = ''
  try {
    const result = await api.setAddressFromMap(request.value.id, payload)
    syncFromRequest(result.data.request)
  }
  catch (error: unknown) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
  }
  finally {
    savingAddress.value = false
  }
}

const setDraftAddress = (payload: { address_text: string; address_lat: number; address_lng: number }) => {
  draftAddress.value = payload
}

const submitStructuredForm = async () => {
  if (!request.value || submitDisabled.value) return

  submittingStructured.value = true
  errorMessage.value = ''
  try {
    if (
      (!request.value.address_text || request.value.address_lat === null || request.value.address_lng === null) &&
      draftAddress.value
    ) {
      const saved = await api.setAddressFromMap(request.value.id, draftAddress.value)
      syncFromRequest(saved.data.request)
    }

    if (!request.value.address_text || request.value.address_lat === null || request.value.address_lng === null) {
      errorMessage.value = t('requester.formAddressRequired')
      return
    }

    const result = await api.submitStructuredIntake(request.value.id, {
      phone: phoneInput.value.trim(),
      visit_time_at: new Date(visitTimeInput.value).toISOString(),
      problem_summary: problemSummaryInput.value.trim(),
      address_text: request.value.address_text!,
      address_lat: request.value.address_lat!,
      address_lng: request.value.address_lng!
    })
    syncFromRequest(result.data.request)
    await navigateTo(`/requester/requests/${request.value.id}/status`)
  }
  catch (error: unknown) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
  }
  finally {
    submittingStructured.value = false
  }
}

onMounted(loadRequest)
</script>

<template>
  <div class="ff-shell flex min-h-dvh flex-col">
    <AppHeader
      :title="t('requester.chatTitle')"
      :subtitle="t('requester.chatHint')"
      logo-text="FF"
      :show-back-button="true"
      back-to="/requester"
    />

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
        <section class="ff-panel-soft ff-rise rounded-3xl p-3">
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

        <section class="ff-panel-soft ff-rise rounded-3xl p-4">
          <p class="text-sm font-bold text-slate-900">{{ greetingText }}</p>
        </section>

        <section class="ff-rise rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-4">
          <p class="text-xs font-bold uppercase tracking-wide text-emerald-700">{{ t('requester.readyToDispatch') }}</p>
          <div class="mt-3 space-y-3">
            <UFormField :label="t('requester.formPhone')" required>
              <UInput
                v-model="phoneInput"
                :placeholder="t('requester.formPhone')"
                :disabled="!canFillForm"
                size="xl"
                variant="outline"
                class="w-full"
              />
            </UFormField>

            <UFormField :label="t('requester.formVisitTime')" required>
              <UInput
                v-model="visitTimeInput"
                type="datetime-local"
                :disabled="!canFillForm"
                size="xl"
                variant="outline"
                class="w-full"
              />
            </UFormField>

            <AddressMapPicker
              :label="t('requester.mapAddressTitle')"
              :save-label="t('requester.mapAddressSave')"
              :locate-label="t('requester.mapLocateMe')"
              :loading="savingAddress"
              :initial-lat="request.address_lat"
              :initial-lng="request.address_lng"
              :initial-address="request.address_text"
              @save="saveAddressFromMap"
              @change="setDraftAddress"
            />

            <UFormField :label="t('requester.formProblem')" required>
              <UTextarea
                v-model="problemSummaryInput"
                :rows="4"
                :placeholder="t('requester.formProblem')"
                :disabled="!canFillForm"
                size="xl"
                variant="outline"
                class="w-full"
                autoresize
              />
            </UFormField>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <UButton :loading="submittingStructured" :disabled="submitDisabled" color="primary" class="font-semibold" @click="submitStructuredForm">
              {{ t('requester.formSubmit') }}
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
      </template>
    </main>
  </div>
</template>
