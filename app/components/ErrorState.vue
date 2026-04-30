<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    message?: string
    retryLabel?: string
  }>(),
  {
    message: '',
    retryLabel: ''
  }
)

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="ff-rise rounded-[28px] border border-[#ffb8c0]/70 bg-gradient-to-b from-[#fff0f2]/90 to-[#ffe1e6]/80 p-4 shadow-[8px_10px_22px_rgba(255,100,122,0.16),-6px_-6px_18px_rgba(255,255,255,0.78)]">
    <div class="flex items-start gap-2">
      <div class="rounded-xl bg-white/70 p-1.5 shadow-sm">
        <UIcon name="i-lucide-alert-triangle" class="size-4 text-[#ff647a]" />
      </div>
      <div class="min-w-0">
        <p class="text-sm font-bold text-[#8e4055]">{{ props.title }}</p>
        <p v-if="props.message" class="mt-1 text-xs leading-5 text-[#9b5063]">{{ props.message }}</p>
      </div>
    </div>
    <UButton
      v-if="props.retryLabel"
      size="xs"
      color="error"
      variant="soft"
      class="mt-3"
      @click="emit('retry')"
    >
      {{ props.retryLabel }}
    </UButton>
  </div>
</template>
