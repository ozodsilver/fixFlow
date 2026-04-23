<script setup lang="ts">
const props = defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="ff-panel-soft ff-rise rounded-2xl border-dashed p-6 text-center">
    <div class="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
      <UIcon name="i-lucide-inbox" class="size-4" />
    </div>
    <p class="text-sm font-bold text-slate-800">{{ props.title }}</p>
    <p v-if="props.description" class="mt-1 text-xs leading-5 text-slate-500">{{ props.description }}</p>
  </div>
</template>
