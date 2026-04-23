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

const domainIcon = computed(() => {
  const slug = props.domain.slug.toLowerCase()
  if (slug.includes('plumb')) return 'i-lucide-wrench'
  if (slug.includes('appliance')) return 'i-lucide-refrigerator'
  if (slug.includes('elect')) return 'i-lucide-zap'
  return 'i-lucide-shield-check'
})
</script>

<template>
  <button
    type="button"
    class="ff-panel-soft ff-rise group w-full rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-300"
    @click="emit('select', props.domain)"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex min-w-0 items-start gap-3">
        <div class="rounded-xl bg-emerald-100 p-2 text-emerald-700">
          <UIcon :name="domainIcon" class="size-4" />
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-extrabold tracking-tight text-slate-900">{{ props.title }}</p>
          <p v-if="props.subtitle" class="mt-1 text-xs leading-4 text-slate-600">{{ props.subtitle }}</p>
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <span class="rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-emerald-700">
          {{ props.domain.slug }}
        </span>
        <UIcon name="i-lucide-chevron-right" class="size-4 text-slate-400 transition group-hover:text-emerald-600" />
      </div>
    </div>
  </button>
</template>
