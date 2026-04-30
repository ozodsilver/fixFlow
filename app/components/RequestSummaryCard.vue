<script setup lang="ts">
import type { ServiceRequest } from '~/types/requester'

const props = defineProps<{
  title: string
  request: ServiceRequest
  labels?: {
    id?: string
    status?: string
    summary?: string
    address?: string
  }
  statusText?: string
  statusClass?: string
}>()
</script>

<template>
  <section class="ff-panel ff-rise rounded-[28px] p-4">
    <p class="text-xs font-bold uppercase tracking-wide text-[#7d78a6]">{{ props.title }}</p>

    <dl class="mt-3 space-y-2 text-sm text-[#2b2853]">
      <div class="flex items-center justify-between gap-3">
        <dt class="text-[#7d78a6]">{{ props.labels?.id || 'ID' }}</dt>
        <dd class="ff-pressed rounded-full px-2.5 py-1 text-xs font-semibold text-[#5c4bd6]">{{ props.request.public_code }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3">
        <dt class="text-[#7d78a6]">{{ props.labels?.status || 'Status' }}</dt>
        <dd class="ff-status-chip" :class="props.statusClass || 'border border-[#ddd5ff] bg-[#f4f0ff] text-[#7d78a6]'">
          {{ props.statusText || props.request.status }}
        </dd>
      </div>
      <div v-if="props.request.problem_summary" class="pt-1">
        <dt class="text-[#7d78a6]">{{ props.labels?.summary || 'Summary' }}</dt>
        <dd class="mt-1 font-medium leading-5">{{ props.request.problem_summary }}</dd>
      </div>
      <div v-if="props.request.address_text" class="pt-1">
        <dt class="text-[#7d78a6]">{{ props.labels?.address || 'Address' }}</dt>
        <dd class="mt-1 font-medium leading-5">{{ props.request.address_text }}</dd>
      </div>
    </dl>
  </section>
</template>
