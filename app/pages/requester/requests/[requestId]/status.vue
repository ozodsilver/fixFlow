<script setup lang="ts">
import type { ServiceRequest } from '~/types/requester'

const route = useRoute()
const requestId = computed(() => String(route.params.requestId || ''))

const api = useRequesterApi()
const { t } = useAppI18n()

const loading = ref(true)
const canceling = ref(false)
const requestState = ref<ServiceRequest | null>(null)
const errorMessage = ref('')

const canCancel = computed(() => {
  const status = requestState.value?.status
  return ['draft', 'intake_in_progress', 'ready_for_dispatch', 'dispatched'].includes(status || '')
})

const loadRequest = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await api.getRequest(requestId.value)
    requestState.value = result.data
  }
  catch (error: unknown) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
  }
  finally {
    loading.value = false
  }
}

const cancelRequest = async () => {
  if (!canCancel.value) return

  canceling.value = true
  try {
    await api.cancelRequest(requestId.value, 'user_cancelled')
    await loadRequest()
  }
  catch (error: unknown) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } })?.data?.error?.message || t('common.unexpectedError')
  }
  finally {
    canceling.value = false
  }
}

onMounted(loadRequest)
</script>

<template>
  <div class="mx-auto min-h-dvh w-full max-w-md bg-slate-50">
    <AppHeader :title="t('requester.statusTitle')" :subtitle="requestState?.public_code || ''" logo-text="FF" />

    <main class="space-y-4 px-4 py-4">
      <LoadingState v-if="loading" :label="t('common.loading')" />

      <ErrorState
        v-else-if="errorMessage && !requestState"
        :title="t('common.unexpectedError')"
        :message="errorMessage"
        :retry-label="t('common.retry')"
        @retry="loadRequest"
      />

      <template v-else-if="requestState">
        <RequestSummaryCard :title="t('requester.summaryTitle')" :request="requestState" />

        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('common.status') }}</p>
          <p class="mt-2 text-sm font-semibold text-slate-900">{{ requestState.status }}</p>
          <p class="mt-1 text-xs text-slate-500">{{ requestState.updated_at }}</p>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <UButton variant="soft" color="neutral" @click="loadRequest">
            {{ t('common.retry') }}
          </UButton>
          <UButton
            color="error"
            variant="soft"
            :disabled="!canCancel"
            :loading="canceling"
            @click="cancelRequest"
          >
            {{ t('common.cancel') }}
          </UButton>
        </div>
      </template>
    </main>
  </div>
</template>
