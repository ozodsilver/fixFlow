<script setup lang="ts">
const props = defineProps<{
  missingFields: string[]
  title: string
  resolveLabel: (field: string) => string
}>()
</script>

<template>
  <section class="ff-rise rounded-2xl border border-[#ffd3b0] bg-[#fff1df]/90 p-3 shadow-[6px_8px_18px_rgba(255,143,156,0.13),-5px_-5px_14px_rgba(255,255,255,0.74)]">
    <p class="text-xs font-bold uppercase tracking-wide text-[#9b673d]">{{ props.title }}</p>
    <ul class="mt-2 space-y-1 text-sm text-[#8e5f3c]">
      <li v-for="field in props.missingFields" :key="field" class="flex items-center gap-2">
        <span class="inline-block h-1.5 w-1.5 rounded-full bg-[#ff8f9c]" />
        <span>{{ props.resolveLabel(field) }}</span>
      </li>
    </ul>
  </section>
</template>
