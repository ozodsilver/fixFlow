import { messages } from '~/i18n/messages'
import type { AppLocale } from '~/types/requester'

function resolvePath(obj: Record<string, unknown>, path: string): string | null {
  const parts = path.split('.')
  let current: unknown = obj

  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in (current as Record<string, unknown>))) {
      return null
    }
    current = (current as Record<string, unknown>)[part]
  }

  return typeof current === 'string' ? current : null
}

export function useAppI18n() {
  const locale = useState<AppLocale>('app-locale', () => 'uz_cyrl')

  if (process.client) {
    const stored = localStorage.getItem('ff_locale') as AppLocale | null
    if (stored === 'uz_cyrl' || stored === 'ru') {
      locale.value = stored
    }

    watch(locale, (value) => {
      localStorage.setItem('ff_locale', value)
    })
  }

  const t = (key: string): string => {
    const fromLocale = resolvePath(messages[locale.value], key)
    if (fromLocale) return fromLocale

    const fallback = resolvePath(messages.uz_cyrl, key)
    return fallback ?? key
  }

  const setLocale = (value: AppLocale) => {
    locale.value = value
  }

  return {
    locale,
    t,
    setLocale,
    locales: [
      { code: 'uz_cyrl' as const, label: t('locale.uz_cyrl') },
      { code: 'ru' as const, label: t('locale.ru') }
    ]
  }
}
