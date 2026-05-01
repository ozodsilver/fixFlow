<script setup lang="ts">
import type { RequestStatus, ServiceDomain, ServiceRequest } from '~/types/requester'

const api = useRequesterApi()
const route = useRoute()
const { t, locale } = useAppI18n()

const loading = ref(true)
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
  if (locale.value === 'ru') return `Здравствуйте${name}. Пожалуйста, введите описание проблемы и данные.`
  return `Салом${name}. Илтимос, муаммо тавсилоти ва маълумотларни киритинг.`
})

const UZ_PHONE_REGEX = /^\+998 \d{2} \d{3} \d{2} \d{2}$/

const phoneFormatError = computed(() => {
  if (!phoneInput.value.trim()) return ''
  if (UZ_PHONE_REGEX.test(phoneInput.value.trim())) return ''
  return "Телефон рақами +998 XX XXX XX XX форматда бўлиши керак."
})

const normalizeUzPhone = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (!digits.startsWith('998')) return ''
  return `+${digits}`
}

const formatUzPhoneInput = (value: string) => {
  const digits = value.replace(/\D/g, '')
  const local = digits.startsWith('998') ? digits.slice(3) : digits
  const limited = local.slice(0, 9)
  const parts = [
    limited.slice(0, 2),
    limited.slice(2, 5),
    limited.slice(5, 7),
    limited.slice(7, 9)
  ].filter(Boolean)
  return `+998${parts.length ? ` ${parts.join(' ')}` : ''}`
}

const onPhoneInput = (value: string | number) => {
  phoneInput.value = formatUzPhoneInput(String(value ?? ''))
}

const minVisitDateTime = computed(() => {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const local = new Date(startOfToday.getTime() - startOfToday.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
})

const visitTimeError = computed(() => {
  if (!visitTimeInput.value.trim()) return ''
  const selected = new Date(visitTimeInput.value)
  if (Number.isNaN(selected.getTime())) return ''

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (selected < startOfToday) {
    return locale.value === 'ru'
      ? 'Нельзя выбрать дату раньше сегодняшнего дня.'
      : 'Бугундан олдинги санани танлаб бўлмайди.'
  }
  return ''
})

const submitDisabled = computed(() => {
  if (!request.value || !canFillForm.value) return true
  if (!phoneInput.value.trim() || !visitTimeInput.value.trim() || !problemSummaryInput.value.trim()) return true
  if (!!phoneFormatError.value) return true
  if (!!visitTimeError.value) return true
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
  if (status === 'draft' || status === 'intake_in_progress') return 'border border-[#ffd3b0] bg-[#fff1df] text-[#9b673d]'
  if (status === 'ready_for_dispatch' || status === 'dispatched') return 'border border-[#cfc5ff] bg-[#eee9ff] text-[#5c4bd6]'
  if (status === 'in_fulfillment') return 'border border-[#a8ead5] bg-[#e5fbf4] text-[#26866e]'
  if (status === 'closed_completed') return 'border border-[#a8ead5] bg-[#e8fff7] text-[#26866e]'
  return 'border border-[#ddd5ff] bg-[#f4f0ff] text-[#7d78a6]'
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
  if (value.phone_e164 && !phoneInput.value) phoneInput.value = formatUzPhoneInput(value.phone_e164)
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
      phone: normalizeUzPhone(phoneInput.value.trim()),
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
        <section class="ff-rise rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('requester.domainLabel') }}</p>
              <p class="mt-1">
                <span class="inline-flex max-w-full items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                  <span class="truncate">{{ domainName }}</span>
                </span>
              </p>
            </div>
            <span v-if="request.status !== 'draft'" class="ff-status-chip shrink-0" :class="statusToneClass(request.status)">
              {{ statusLabel(request.status) }}
            </span>
          </div>
        </section>

        <section class="ff-rise rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-sm font-bold text-slate-800">{{ greetingText }}</p>
        </section>

        <section class="ff-rise rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-bold uppercase tracking-wide text-violet-700">{{ t('requester.readyToDispatch') }}</p>
          <div class="mt-3 space-y-3">
            <UFormField :label="t('requester.formPhone')" required>
              <UInput
                v-model="phoneInput"
                placeholder="+998 90 123 45 67"
                :disabled="!canFillForm"
                size="xl"
                variant="outline"
                class="w-full"
                @update:model-value="onPhoneInput"
              />
              <p v-if="phoneFormatError" class="mt-1 text-xs font-medium text-rose-600">
                {{ phoneFormatError }}
              </p>
            </UFormField>

            <UFormField required>
              <template #label>
                <span class="inline-flex items-center gap-1.5">
                  <span>{{ t('requester.formVisitTime') }}</span>
                  <span class="group relative inline-flex">
                    <button
                      type="button"
                      class="inline-flex size-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-[#5c4bd6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7358e8]"
                      :aria-label="t('requester.formVisitTimeHint')"
                    >
                      <UIcon name="i-lucide-info" class="size-4" />
                    </button>
                    <span
                      class="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 rounded-xl bg-[#2b2853] px-3 py-2 text-center text-xs font-medium leading-4 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                      role="tooltip"
                    >
                      {{ t('requester.formVisitTimeHint') }}
                    </span>
                  </span>
                </span>
              </template>
              <UInput
                v-model="visitTimeInput"
                type="datetime-local"
                :min="minVisitDateTime"
                :disabled="!canFillForm"
                size="xl"
                variant="outline"
                class="w-full"
              />
              <p v-if="visitTimeError" class="mt-1 text-xs font-medium text-rose-600">
                {{ visitTimeError }}
              </p>
            </UFormField>

            <AddressMapPicker
              :label="t('requester.mapAddressTitle')"
              :locate-label="t('requester.mapLocateMe')"
              :initial-lat="request.address_lat"
              :initial-lng="request.address_lng"
              :initial-address="request.address_text"
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
