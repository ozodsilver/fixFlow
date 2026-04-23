<script setup lang="ts">
const props = defineProps<{ label: string }>()
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4">
    <div class="flex items-center gap-3">
      <UIcon name="i-lucide-loader-2" class="size-4 animate-spin text-slate-500" />
      <p class="text-sm text-slate-600">{{ props.label }}</p>
    </div>
  </div>
</template>
