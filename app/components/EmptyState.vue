<script setup lang="ts">
const props = defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="ff-panel-soft ff-rise rounded-[28px] border-dashed p-6 text-center">
    <div class="ff-icon-tile mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl">
      <UIcon name="i-lucide-inbox" class="size-4" />
    </div>
    <p class="text-sm font-bold text-[#2b2853]">{{ props.title }}</p>
    <p v-if="props.description" class="mt-1 text-xs leading-5 text-[#7d78a6]">{{ props.description }}</p>
  </div>
</template>
