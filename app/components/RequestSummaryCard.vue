<script setup lang="ts">
import type { ServiceRequest } from '~/types/requester'

const props = defineProps<{
  title: string
  request: ServiceRequest
}>()
</script>

<template>
  <section class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
    <p class="text-xs font-semibold uppercase tracking-wide text-emerald-700">{{ props.title }}</p>

    <dl class="mt-3 space-y-2 text-sm text-emerald-900">
      <div class="flex items-center justify-between gap-3">
        <dt class="text-emerald-700">ID</dt>
        <dd class="font-medium">{{ props.request.public_code }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3">
        <dt class="text-emerald-700">Status</dt>
        <dd class="font-medium">{{ props.request.status }}</dd>
      </div>
      <div v-if="props.request.problem_summary" class="pt-1">
        <dt class="text-emerald-700">Summary</dt>
        <dd class="mt-1 font-medium leading-5">{{ props.request.problem_summary }}</dd>
      </div>
      <div v-if="props.request.address_text" class="pt-1">
        <dt class="text-emerald-700">Address</dt>
        <dd class="mt-1 font-medium leading-5">{{ props.request.address_text }}</dd>
      </div>
    </dl>
  </section>
</template>
