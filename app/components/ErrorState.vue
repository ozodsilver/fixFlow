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
  <div class="rounded-2xl border border-rose-200 bg-rose-50 p-4">
    <p class="text-sm font-semibold text-rose-800">{{ props.title }}</p>
    <p v-if="props.message" class="mt-1 text-xs text-rose-700">{{ props.message }}</p>
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
