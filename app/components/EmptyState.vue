<script setup lang="ts">
const props = defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="ff-panel ff-rise rounded-2xl border-dashed p-6 text-center">
    <p class="text-sm font-bold text-slate-800">{{ props.title }}</p>
    <p v-if="props.description" class="mt-1 text-xs leading-5 text-slate-500">{{ props.description }}</p>
  </div>
</template>
