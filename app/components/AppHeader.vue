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

const switchLocale = (value: AppLocale) => setLocale(value)
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-white/50 bg-white/75 backdrop-blur-xl">
    <div class="ff-shell flex items-start gap-3 px-4 py-3">
      <div
        class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-black text-white shadow-sm"
      >
        {{ props.logoText }}
      </div>

      <div class="min-w-0 flex-1">
        <h1 class="truncate text-[17px] font-black tracking-tight text-slate-900">{{ props.title }}</h1>
        <p v-if="props.subtitle" class="mt-0.5 text-xs leading-4 text-slate-600">{{ props.subtitle }}</p>
      </div>

      <div v-if="props.showLocaleSwitch" class="ff-panel-soft grid shrink-0 grid-cols-2 rounded-xl p-0.5">
        <button
          type="button"
          class="rounded-[9px] px-2 py-1 text-[11px] font-bold transition"
          :class="locale === 'uz_cyrl' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'"
          @click="switchLocale('uz_cyrl')"
        >
          Ўз
        </button>
        <button
          type="button"
          class="rounded-[9px] px-2 py-1 text-[11px] font-bold transition"
          :class="locale === 'ru' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'"
          @click="switchLocale('ru')"
        >
          Ру
        </button>
      </div>
    </div>
  </header>
</template>
