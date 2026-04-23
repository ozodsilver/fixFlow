<script setup lang="ts">
const props = defineProps<{ label: string }>()
</script>

<template>
  <div class="ff-panel-soft ff-rise rounded-2xl p-4">
    <div class="flex items-center gap-3">
      <div class="rounded-lg bg-emerald-100 p-1.5">
        <UIcon name="i-lucide-loader-2" class="size-4 animate-spin text-emerald-700" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-slate-700">{{ props.label }}</p>
        <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div class="h-full w-1/2 animate-pulse rounded-full bg-emerald-500" />
        </div>
      </div>
    </div>
  </div>
</template>
