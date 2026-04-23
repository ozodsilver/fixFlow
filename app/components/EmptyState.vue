<script setup lang="ts">
const props = defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
    <p class="text-sm font-semibold text-slate-800">{{ props.title }}</p>
    <p v-if="props.description" class="mt-1 text-xs text-slate-500">{{ props.description }}</p>
  </div>
</template>
