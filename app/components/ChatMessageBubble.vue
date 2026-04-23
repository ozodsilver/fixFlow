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
</script>

<template>
  <div class="flex" :class="isUser ? 'justify-end' : 'justify-start'">
    <div
      class="max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-5 shadow-sm"
      :class="[
        isUser
          ? 'rounded-br-md bg-emerald-600 text-white'
          : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
      ]"
    >
      <p class="whitespace-pre-wrap">{{ props.text }}</p>
      <p v-if="props.time" class="mt-1 text-[10px]" :class="isUser ? 'text-emerald-100' : 'text-slate-400'">
        {{ props.time }}
      </p>
    </div>
  </div>
</template>
