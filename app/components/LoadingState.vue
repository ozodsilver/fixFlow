<script setup lang="ts">
const props = defineProps<{ label: string }>()
</script>

<template>
  <div class="ff-panel ff-rise rounded-2xl p-4">
    <div class="flex items-center gap-3">
      <UIcon name="i-lucide-loader-2" class="size-4 animate-spin text-emerald-600" />
      <p class="text-sm font-medium text-slate-700">{{ props.label }}</p>
    </div>
  </div>
</template>
