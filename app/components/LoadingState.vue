<script setup lang="ts">
const props = defineProps<{ label: string }>()
</script>

<template>
  <div class="ff-panel-soft ff-rise rounded-3xl p-4">
    <div class="flex items-center gap-3.5">
      <div class="ff-glow flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500">
        <UIcon name="i-lucide-loader-2" class="size-5 animate-spin text-white [--icon-stroke-width:2.5]" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-slate-700">{{ props.label }}</p>
        <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200/90">
          <div class="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500" />
        </div>
      </div>
    </div>
  </div>
</template>
