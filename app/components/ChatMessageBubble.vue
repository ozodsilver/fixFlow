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
      class="max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-5"
      :class="[
        isUser
          ? 'rounded-br-md bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm'
          : isSystem
            ? 'rounded-bl-md border border-amber-200 bg-amber-50 text-amber-900'
            : 'rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm'
      ]"
    >
      <p class="whitespace-pre-wrap">{{ props.text }}</p>
      <p
        v-if="props.time"
        class="mt-1 text-[10px]"
        :class="isUser ? 'text-emerald-100' : isSystem ? 'text-amber-700' : 'text-slate-400'"
      >
        {{ props.time }}
      </p>
    </div>
  </div>
</template>
