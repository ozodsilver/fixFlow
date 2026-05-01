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
    class="ff-service-card group min-h-[150px] w-full rounded-[26px] p-3 text-left transition hover:-translate-y-0.5"
    @click="emit('select', props.domain)"
  >
    <div class="flex h-full flex-col justify-between gap-3">
      <div class="flex items-start justify-between gap-2">
        <div class="ff-icon-tile flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px]">
          <UIcon :name="domainIcon" class="size-7" />
        </div>
        <span class="ff-pressed flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
          <UIcon name="i-lucide-chevron-right" class="size-5 text-[#7358e8] transition group-hover:text-[#ff8f9c]" />
        </span>
      </div>

      <div class="min-w-0">
        <p class="line-clamp-2 text-[13px] font-extrabold leading-4 text-[#2b2853]">{{ props.title }}</p>
        <p v-if="props.subtitle" class="mt-1 text-[11px] leading-4 text-[#7d78a6]">{{ props.subtitle }}</p>
      </div>
    </div>
  </button>
</template>
