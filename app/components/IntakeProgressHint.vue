<script setup lang="ts">
const props = defineProps<{
  missingFields: string[]
  title: string
  resolveLabel: (field: string) => string
}>()
</script>

<template>
  <section class="ff-rise rounded-2xl border border-amber-200 bg-amber-50/90 p-3">
    <p class="text-xs font-bold uppercase tracking-wide text-amber-700">{{ props.title }}</p>
    <ul class="mt-2 space-y-1 text-sm text-amber-900">
      <li v-for="field in props.missingFields" :key="field" class="flex items-center gap-2">
        <span class="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
        <span>{{ props.resolveLabel(field) }}</span>
      </li>
    </ul>
  </section>
</template>
