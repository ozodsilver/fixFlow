<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    placeholder: string
    sendLabel?: string
    loading?: boolean
    disabled?: boolean
  }>(),
  {
    sendLabel: 'Send',
    loading: false,
    disabled: false
  }
)

const emit = defineEmits<{
  send: [string]
}>()

const text = ref('')

const submit = () => {
  const value = text.value.trim()
  if (!value || props.loading || props.disabled) return
  emit('send', value)
  text.value = ''
}
</script>

<template>
  <div class="sticky bottom-0 border-t border-white/50 bg-white/80 p-3 backdrop-blur-xl">
    <div class="ff-shell flex items-end gap-2">
      <UTextarea
        v-model="text"
        :rows="2"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        class="flex-1"
        autoresize
        @keydown.enter.exact.prevent="submit"
      />
      <UButton
        :loading="props.loading"
        :disabled="props.disabled"
        color="primary"
        class="h-10 shrink-0 rounded-xl px-4 font-semibold"
        @click="submit"
      >
        {{ props.sendLabel }}
      </UButton>
    </div>
  </div>
</template>
