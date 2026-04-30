<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    role: 'user' | 'ai' | 'system'
    text: string
    time?: string
  }>(),
  {
    time: ''
  }
)

const isUser = computed(() => props.role === 'user')
const isSystem = computed(() => props.role === 'system')
</script>

<template>
  <div class="ff-rise flex" :class="isUser ? 'justify-end' : 'justify-start'">
    <div
      class="max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-5"
      :class="[
        isUser
          ? 'rounded-br-md bg-gradient-to-br from-[#6da684] via-[#7358e8] to-[#5c4bd6] text-white shadow-[8px_10px_20px_rgba(115,88,232,0.25)]'
          : isSystem
            ? 'rounded-bl-md border border-[#ffd3b0] bg-gradient-to-br from-[#fff1df] to-[#ffe1c4] text-[#9b673d] shadow-sm'
            : 'rounded-bl-md border border-white/70 bg-gradient-to-br from-white/80 to-[#f1ecff] text-[#2b2853] shadow-[7px_8px_18px_rgba(103,84,187,0.18),-5px_-5px_14px_rgba(255,255,255,0.76)]'
      ]"
    >
      <p class="whitespace-pre-wrap">{{ props.text }}</p>
      <p
        v-if="props.time"
        class="mt-1 text-[10px]"
        :class="isUser ? 'text-[#e5fbf4]' : isSystem ? 'text-[#9b673d]' : 'text-[#8f88b6]'"
      >
        {{ props.time }}
      </p>
    </div>
  </div>
</template>
