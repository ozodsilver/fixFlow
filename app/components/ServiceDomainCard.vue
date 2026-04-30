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
    class="ff-panel-soft ff-rise group w-full rounded-[28px] p-4 text-left transition hover:-translate-y-0.5"
    @click="emit('select', props.domain)"
  >
    <div class="flex items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-3">
        <div class="ff-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
          <UIcon :name="domainIcon" class="size-4" />
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-extrabold text-[#2b2853]">{{ props.title }}</p>
          <p v-if="props.subtitle" class="mt-1 text-xs leading-4 text-[#7d78a6]">{{ props.subtitle }}</p>
        </div>
      </div>
      <div class="flex shrink-0 items-center">
        <span class="ff-pressed flex h-8 w-8 items-center justify-center rounded-full">
          <UIcon name="i-lucide-chevron-right" class="size-4 text-[#7358e8] transition group-hover:text-[#ff8f9c]" />
        </span>
      </div>
    </div>
  </button>
</template>
