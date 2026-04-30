<script setup lang="ts">
import type { AppLocale } from '~/types/requester'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    logoText?: string
    showLocaleSwitch?: boolean
    showBackButton?: boolean
    backTo?: string
  }>(),
  {
    subtitle: '',
    logoText: 'FF',
    showLocaleSwitch: true,
    showBackButton: false,
    backTo: ''
  }
)

const { locale, setLocale, t } = useAppI18n()
const router = useRouter()

const switchLocale = (value: AppLocale) => setLocale(value)

const goBack = async () => {
  if (process.client && window.history.length > 1) {
    await router.back()
    return
  }

  if (props.backTo) {
    await navigateTo(props.backTo)
  }
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-slate-200 bg-white">
    <div class="ff-shell flex items-start gap-3 px-4 py-3.5">
      <button
        v-if="props.showBackButton"
        type="button"
        class="ff-panel-soft mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-slate-700 transition hover:-translate-y-0.5 hover:text-slate-900"
        :aria-label="t('common.back')"
        @click="goBack"
      >
        <UIcon name="i-lucide-chevron-left" class="size-5" />
      </button>

      <div
        class="ff-glow flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-600 text-sm font-black text-white"
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
