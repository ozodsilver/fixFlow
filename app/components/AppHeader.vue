<script setup lang="ts">
import type { AppLocale } from '~/types/requester'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    logoText?: string
    showLocaleSwitch?: boolean
  }>(),
  {
    subtitle: '',
    logoText: 'FF',
    showLocaleSwitch: true
  }
)

const { locale, setLocale } = useAppI18n()

const onLocaleChange = (value: string | number) => {
  if (value === 'uz_cyrl' || value === 'ru') {
    setLocale(value as AppLocale)
  }
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-white/40 bg-white/70 backdrop-blur-xl">
    <div class="ff-shell flex items-start gap-3 px-4 py-3">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-extrabold text-white shadow-sm"
      >
        {{ props.logoText }}
      </div>

      <div class="min-w-0 flex-1">
        <h1 class="truncate text-base font-extrabold tracking-tight text-slate-900">{{ props.title }}</h1>
        <p v-if="props.subtitle" class="mt-0.5 text-xs leading-4 text-slate-600">{{ props.subtitle }}</p>
      </div>

      <div v-if="props.showLocaleSwitch" class="shrink-0">
        <USelect
          :model-value="locale"
          :items="[
            { label: 'Ўзбекча', value: 'uz_cyrl' },
            { label: 'Русча', value: 'ru' }
          ]"
          size="xs"
          class="w-28"
          @update:model-value="onLocaleChange"
        />
      </div>
    </div>
  </header>
</template>
