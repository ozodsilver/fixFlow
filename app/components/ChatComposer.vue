<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    placeholder: string
    sendLabel?: string
    loading?: boolean
  }>(),
  {
    sendLabel: 'Send',
    loading: false
  }
)

const emit = defineEmits<{
  send: [string]
}>()

const text = ref('')

const submit = () => {
  const value = text.value.trim()
  if (!value || props.loading) return
  emit('send', value)
  text.value = ''
}
</script>

<template>
  <div class="border-t border-slate-200 bg-white p-3">
    <div class="mx-auto flex w-full max-w-md items-end gap-2">
      <UTextarea
        v-model="text"
        :rows="2"
        :placeholder="props.placeholder"
        class="flex-1"
        autoresize
        @keydown.enter.exact.prevent="submit"
      />
      <UButton :loading="props.loading" color="primary" class="h-10 shrink-0" @click="submit">
        {{ props.sendLabel }}
      </UButton>
    </div>
  </div>
</template>
