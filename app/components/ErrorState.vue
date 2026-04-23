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
  <div class="ff-rise rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50 to-rose-100/70 p-4">
    <div class="flex items-start gap-2">
      <div class="rounded-lg bg-white/80 p-1.5">
        <UIcon name="i-lucide-alert-triangle" class="size-4 text-rose-700" />
      </div>
      <div class="min-w-0">
        <p class="text-sm font-bold text-rose-900">{{ props.title }}</p>
        <p v-if="props.message" class="mt-1 text-xs leading-5 text-rose-800">{{ props.message }}</p>
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
