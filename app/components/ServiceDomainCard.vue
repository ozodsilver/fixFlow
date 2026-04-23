<script setup lang="ts">
import type { ServiceDomain } from '~/types/requester'

const props = defineProps<{
  domain: ServiceDomain
  title: string
  subtitle?: string
}>()

const emit = defineEmits<{
  select: [ServiceDomain]
}>()
</script>

<template>
  <button
    type="button"
    class="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300 hover:shadow"
    @click="emit('select', props.domain)"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold text-slate-900">{{ props.title }}</p>
        <p v-if="props.subtitle" class="mt-1 text-xs text-slate-600">{{ props.subtitle }}</p>
      </div>
      <span class="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
        {{ props.domain.slug }}
      </span>
    </div>
  </button>
</template>
