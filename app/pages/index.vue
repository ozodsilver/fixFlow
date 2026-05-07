<script setup lang="ts">
const route = useRoute()
const api = useRequesterApi()
const { locale } = useAppI18n()
const debugEnabled = computed(() => String(route.query.ffdebug || '') === '1')
const debugLines = ref<string[]>([])
const debugFinal = ref('')

const pickDispatchIdFromStartParam = (startParamRaw: string) => {
  if (!startParamRaw.startsWith('dispatch_')) return ''
  return startParamRaw.slice('dispatch_'.length)
}

const extractRawParam = (input: string, key: string): string => {
  const normalized = input.startsWith('?') || input.startsWith('#') ? input.slice(1) : input
  if (!normalized) return ''
  for (const part of normalized.split('&')) {
    if (!part.startsWith(`${key}=`)) continue
    const raw = part.slice(key.length + 1)
    if (!raw) return ''
    try {
      return decodeURIComponent(raw)
    }
    catch {
      return raw
    }
  }
  return ''
}

const pickDispatchIdFromInitData = (initDataRaw: string) => {
  if (!initDataRaw) return ''
  const startParam = extractRawParam(initDataRaw, 'start_param')
  return pickDispatchIdFromStartParam(startParam)
}

const pickDispatchIdFromQuery = () => {
  const directDispatchId = route.query.dispatch_id ? String(route.query.dispatch_id) : ''
  debugLines.value.push(`query.dispatch_id = ${directDispatchId || '-'}`)
  if (directDispatchId) return directDispatchId

  const startParamRaw = route.query.startapp
    ? String(route.query.startapp)
    : route.query.tgWebAppStartParam
      ? String(route.query.tgWebAppStartParam)
      : ''
  debugLines.value.push(`query.startapp/tgWebAppStartParam = ${startParamRaw || '-'}`)
  const fromQuery = pickDispatchIdFromStartParam(startParamRaw)
  debugLines.value.push(`dispatch from query = ${fromQuery || '-'}`)
  if (fromQuery) return fromQuery

  if (!process.client) return ''
  const fromSearch = pickDispatchIdFromStartParam(
    extractRawParam(window.location.search, 'startapp') || extractRawParam(window.location.search, 'tgWebAppStartParam')
  )
  debugLines.value.push(`dispatch from window.search = ${fromSearch || '-'}`)
  if (fromSearch) return fromSearch

  const fromHash = pickDispatchIdFromStartParam(
    extractRawParam(window.location.hash, 'startapp') || extractRawParam(window.location.hash, 'tgWebAppStartParam')
  )
  debugLines.value.push(`dispatch from window.hash = ${fromHash || '-'}`)
  if (fromHash) return fromHash

  const tgWebAppData = extractRawParam(window.location.search, 'tgWebAppData') || extractRawParam(window.location.hash, 'tgWebAppData')
  const fromInitDataParam = pickDispatchIdFromInitData(tgWebAppData)
  debugLines.value.push(`dispatch from tgWebAppData = ${fromInitDataParam || '-'}`)
  return fromInitDataParam
}

const pickDispatchIdFromTelegram = () => {
  if (!process.client) return ''
  const webApp = (window as Window & { Telegram?: { WebApp?: { initDataUnsafe?: { start_param?: string }, initData?: string } } }).Telegram?.WebApp
  const fromUnsafe = webApp?.initDataUnsafe?.start_param ? String(webApp.initDataUnsafe.start_param) : ''
  debugLines.value.push(`Telegram.initDataUnsafe.start_param = ${fromUnsafe || '-'}`)
  const dispatchFromUnsafe = pickDispatchIdFromStartParam(fromUnsafe)
  debugLines.value.push(`dispatch from initDataUnsafe = ${dispatchFromUnsafe || '-'}`)
  if (dispatchFromUnsafe) return dispatchFromUnsafe

  const fromInitData = webApp?.initData ? String(webApp.initData) : ''
  const dispatchFromInitData = pickDispatchIdFromInitData(fromInitData)
  debugLines.value.push(`dispatch from initData(raw) = ${dispatchFromInitData || '-'}`)
  return dispatchFromInitData
}

const getTelegramInitData = () => {
  if (!process.client) return ''
  const webApp = (window as Window & { Telegram?: { WebApp?: { initData?: string; ready?: () => void } } }).Telegram?.WebApp
  return webApp?.initData?.trim()
    || extractRawParam(window.location.search, 'tgWebAppData')?.trim()
    || extractRawParam(window.location.hash, 'tgWebAppData')?.trim()
    || sessionStorage.getItem('ff_tg_init_data')
    || ''
}

const tryTelegramAuth = async () => {
  const runtimeConfig = useRuntimeConfig()
  // Telegram.WebApp is synchronously available in Mini App context.
  // By the time we call this (after a failed bootstrap), SDK is definitely ready.
  const initData = getTelegramInitData()
  if (initData) {
    sessionStorage.setItem('ff_tg_init_data', initData)
    await api.initAuth({ init_data: initData, locale: locale.value })
    return
  }

  if (runtimeConfig.public.allowDevAuthBypass) {
    const devTelegramUserId = Number(sessionStorage.getItem('ff_dev_tg_uid') || '900001')
    sessionStorage.setItem('ff_dev_tg_uid', String(devTelegramUserId))
    await api.initAuth({ telegram_user_id: devTelegramUserId, display_name: 'Dev Local User', locale: locale.value })
  }
}

const navigateByRole = async () => {
  const runtimeConfig = useRuntimeConfig()

  // Proactive auth: initiate session before bootstrap to avoid fail→retry round-trip.
  // We already have Telegram.WebApp.initData available synchronously by onMounted.
  const initData = getTelegramInitData()
  if (initData) {
    try {
      sessionStorage.setItem('ff_tg_init_data', initData)
      await api.initAuth({ init_data: initData, locale: locale.value })
    }
    catch { /* session may already be valid, proceed to bootstrap */ }
  }
  else if (runtimeConfig.public.allowDevAuthBypass) {
    try {
      const devTelegramUserId = Number(sessionStorage.getItem('ff_dev_tg_uid') || '900001')
      sessionStorage.setItem('ff_dev_tg_uid', String(devTelegramUserId))
      await api.initAuth({ telegram_user_id: devTelegramUserId, display_name: 'Dev Local User', locale: locale.value })
    }
    catch { /* ignore */ }
  }

  try {
    const bootstrap = await api.bootstrap()
    if (bootstrap.data.roles.is_master) {
      debugFinal.value = '/master/orders'
      if (!debugEnabled.value) await navigateTo('/master/orders', { replace: true })
      return
    }
    if (bootstrap.data.roles.is_admin) {
      debugFinal.value = '/admin'
      if (!debugEnabled.value) await navigateTo('/admin', { replace: true })
      return
    }
  }
  catch (error: unknown) {
    const code = (error as { data?: { error?: { code?: string } } })?.data?.error?.code
    const statusCode = (error as { statusCode?: number })?.statusCode
    if (code === 'auth.session_expired' || statusCode === 401) {
      try {
        await tryTelegramAuth()
        const bootstrap = await api.bootstrap()
        if (bootstrap.data.roles.is_master) {
          debugFinal.value = '/master/orders'
          if (!debugEnabled.value) await navigateTo('/master/orders', { replace: true })
          return
        }
        if (bootstrap.data.roles.is_admin) {
          debugFinal.value = '/admin'
          if (!debugEnabled.value) await navigateTo('/admin', { replace: true })
          return
        }
      }
      catch {
        debugLines.value.push('role bootstrap failed; opening requester')
      }
    }
  }

  debugFinal.value = '/requester'
  if (!debugEnabled.value) await navigateTo('/requester', { replace: true })
}

const resolveAndNavigate = async () => {
  debugLines.value = []
  let dispatchId = pickDispatchIdFromQuery()
  const hasDispatchHintInUrl =
    (process.client && (
      window.location.href.includes('dispatch_') ||
      window.location.search.includes('startapp=') ||
      window.location.search.includes('tgWebAppStartParam=') ||
      window.location.hash.includes('startapp=') ||
      window.location.hash.includes('tgWebAppStartParam=')
    )) || false
  debugLines.value.push(`hasDispatchHintInUrl = ${hasDispatchHintInUrl}`)

  if (!dispatchId && process.client) {
    // Telegram.WebApp.initDataUnsafe is synchronously available; only poll briefly
    // for edge-case SDK injection delay.
    // With URL hint: 8 × 80ms = 640ms max. Without hint: 2 × 80ms = 160ms max.
    // Was: 50 × 120ms = 6000ms regardless.
    const maxAttempts = hasDispatchHintInUrl ? 8 : 2
    for (let i = 0; i < maxAttempts; i += 1) {
      dispatchId = pickDispatchIdFromTelegram()
      if (dispatchId) break
      await new Promise(resolve => setTimeout(resolve, 80))
    }

    if (dispatchId) {
      sessionStorage.setItem('ff_last_dispatch_id', dispatchId)
    }
    else if (hasDispatchHintInUrl) {
      const cachedDispatchId = sessionStorage.getItem('ff_last_dispatch_id') || ''
      dispatchId = cachedDispatchId
    }
  }
  debugLines.value.push(`final dispatchId = ${dispatchId || '-'}`)

  if (dispatchId) {
    debugFinal.value = `/master/dispatches/${dispatchId}`
    if (debugEnabled.value) return
    await navigateTo(`/master/dispatches/${dispatchId}`, { replace: true })
    return
  }
  if (debugEnabled.value || hasDispatchHintInUrl) return
  await navigateByRole()
}

onMounted(resolveAndNavigate)
</script>

<template>
  <div v-if="debugEnabled || debugLines.some(line => line.includes('hasDispatchHintInUrl = true'))" class="min-h-dvh bg-slate-50 p-4 text-slate-800">
    <div class="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p class="text-sm font-bold">Start Param Debug</p>
      <p class="mt-1 text-xs text-slate-500">Quyidagi qiymatlar Telegram ichida real kelgan ma'lumotlar.</p>
      <pre class="mt-3 max-h-[55vh] overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-emerald-300">{{ debugLines.join('\n') }}</pre>
      <p class="mt-3 text-sm font-semibold">Route: {{ debugFinal || '-' }}</p>
      <div class="mt-3 flex gap-2">
        <UButton color="primary" @click="resolveAndNavigate">Qayta tekshirish</UButton>
        <UButton color="neutral" variant="soft" @click="navigateTo(debugFinal || '/requester', { replace: true })">Davom etish</UButton>
      </div>
    </div>
  </div>
</template>
