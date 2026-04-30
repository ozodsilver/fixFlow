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

const goHome = async () => {
  await navigateTo('/requester')
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-white/60 bg-[#edf2ef]/80 shadow-[0_10px_28px_rgba(108,126,115,0.16)] backdrop-blur-xl">
    <div class="h-1 w-full bg-[#7a62ea]" />
    <div class="ff-shell flex items-start gap-3 px-4 py-3.5">
      <button
        v-if="props.showBackButton"
        type="button"
        class="ff-action mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center text-[#366a57]"
        :aria-label="t('common.back')"
        @click="goBack"
      >
        <UIcon name="i-lucide-chevron-left" class="size-5" />
      </button>

      <button
        type="button"
        class="ff-action flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden p-1"
        aria-label="Go home"
        @click="goHome"
      >
        <img src="/fixFlow.png" alt="fixFlow logo" class="h-full w-full rounded-xl object-cover" />
      </button>

      <div class="min-w-0 flex-1">
        <div class="flex items-baseline gap-2">
          <h1
            class="truncate text-[18px] font-extrabold"
            :class="props.title === 'HGS' ? 'text-orange-500' : 'text-[#223027]'"
          >
            {{ props.title }}
          </h1>
          <span
            v-if="props.title === 'HGS'"
            class="truncate text-[10px] font-semibold uppercase tracking-wide text-violet-600"
          >
            Home Guarantee Service
          </span>
        </div>
        <p v-if="props.subtitle" class="mt-0.5 text-xs leading-4 text-[#6d7c70]">{{ props.subtitle }}</p>
      </div>

      <div v-if="props.showLocaleSwitch" class="ff-pressed grid shrink-0 grid-cols-2 rounded-2xl p-1">
        <button
          type="button"
          class="rounded-[9px] px-2 py-1 text-[11px] font-bold transition"
          :class="locale === 'uz_cyrl' ? 'ff-primary-gradient text-white' : 'text-[#6d7c70] hover:text-[#223027]'"
          @click="switchLocale('uz_cyrl')"
        >
          Ўз
        </button>
        <button
          type="button"
          class="rounded-[9px] px-2 py-1 text-[11px] font-bold transition"
          :class="locale === 'ru' ? 'ff-primary-gradient text-white' : 'text-[#6d7c70] hover:text-[#223027]'"
          @click="switchLocale('ru')"
        >
          Ру
        </button>
      </div>
    </div>
  </header>
</template>
