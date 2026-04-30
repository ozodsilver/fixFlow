<script setup lang="ts">
const props = defineProps<{ label: string }>()
</script>

<template>
  <div class="ff-panel-soft ff-rise rounded-3xl p-4">
    <div class="flex items-center gap-3.5">
      <div class="ff-primary-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
        <UIcon name="i-lucide-loader-2" class="size-5 animate-spin text-white [--icon-stroke-width:2.5]" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-[#7d78a6]">{{ props.label }}</p>
        <div class="ff-pressed mt-2 h-2 w-full overflow-hidden rounded-full">
          <div class="h-full w-1/2 animate-pulse rounded-full bg-[#7a62ea]" />
        </div>
      </div>
    </div>
  </div>
</template>
