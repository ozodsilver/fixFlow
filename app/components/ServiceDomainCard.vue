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
    class="ff-panel ff-rise group w-full rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-300"
    @click="emit('select', props.domain)"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="truncate text-sm font-bold tracking-tight text-slate-900">{{ props.title }}</p>
        <p v-if="props.subtitle" class="mt-1 text-xs leading-4 text-slate-600">{{ props.subtitle }}</p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <span class="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
          {{ props.domain.slug }}
        </span>
        <UIcon name="i-lucide-chevron-right" class="size-4 text-slate-400 transition group-hover:text-emerald-600" />
      </div>
    </div>
  </button>
</template>
