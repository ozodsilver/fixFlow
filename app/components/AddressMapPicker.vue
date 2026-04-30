<script setup lang="ts">
interface PickedAddress {
  address_text: string
  address_lat: number
  address_lng: number
}

const props = withDefaults(
  defineProps<{
    label: string
    saveLabel: string
    locateLabel?: string
    loading?: boolean
    initialLat?: number | null
    initialLng?: number | null
    initialAddress?: string | null
  }>(),
  {
    locateLabel: 'Mening joylashuvim',
    loading: false,
    initialLat: null,
    initialLng: null,
    initialAddress: ''
  }
)

const emit = defineEmits<{
  save: [PickedAddress]
  change: [PickedAddress]
}>()

const mapEl = ref<HTMLElement | null>(null)
const addressText = ref(props.initialAddress || '')
const lat = ref<number | null>(props.initialLat ?? null)
const lng = ref<number | null>(props.initialLng ?? null)
const ready = ref(false)
const locating = ref(false)
const locateError = ref('')

let map: any = null
let marker: any = null

const canSave = computed(() =>
  !!addressText.value.trim() && lat.value !== null && lng.value !== null && !props.loading
)

const formatResolvedAddress = (payload: any) => {
  const addr = payload?.address || {}
  const streetName = addr.road || addr.pedestrian || addr.footway || addr.path || addr.residential || addr.cycleway || ''
  const street = [streetName, addr.house_number].filter(Boolean).join(' ').trim()
  const district = addr.suburb || addr.city_district || addr.neighbourhood || addr.county || ''
  const region = addr.state || addr.region || ''
  const city = addr.city || addr.town || addr.village || ''

  const parts = [street, district, city, region].filter(Boolean)
  if (parts.length > 0) return parts.join(', ')

  const display = payload?.display_name
  if (typeof display === 'string' && display.trim()) return display.trim()
  return ''
}

const reverseGeocode = async (point: { lat: number; lng: number }) => {
  const params = new URLSearchParams({
    format: 'jsonv2',
    lat: String(point.lat),
    lon: String(point.lng),
    'accept-language': 'uz,ru'
  })

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    headers: {
      Accept: 'application/json'
    }
  })

  if (!response.ok) throw new Error('reverse_geocode_failed')
  const data = await response.json()
  return formatResolvedAddress(data)
}

const loadLeaflet = async () => {
  if ((window as any).L) return (window as any).L

  if (!document.querySelector('link[data-leaflet-css]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.setAttribute('data-leaflet-css', '1')
    document.head.appendChild(link)
  }

  await new Promise<void>((resolve, reject) => {
    if (document.querySelector('script[data-leaflet-js]')) {
      const check = () => {
        if ((window as any).L) resolve()
        else setTimeout(check, 50)
      }
      check()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.setAttribute('data-leaflet-js', '1')
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Leaflet script failed to load'))
    document.body.appendChild(script)
  })

  return (window as any).L
}

const placeMarker = async (L: any, point: { lat: number; lng: number }) => {
  if (!map) return
  locateError.value = ''
  lat.value = Number(point.lat.toFixed(6))
  lng.value = Number(point.lng.toFixed(6))

  if (!marker) {
    marker = L.marker([lat.value, lng.value]).addTo(map)
  }
  else {
    marker.setLatLng([lat.value, lng.value])
  }

  try {
    const resolvedAddress = await reverseGeocode(point)
    addressText.value = resolvedAddress || `${lat.value}, ${lng.value}`
  }
  catch {
    addressText.value = `${lat.value}, ${lng.value}`
  }

  const text = addressText.value.trim()
  if (text) {
    emit('change', {
      address_text: text,
      address_lat: lat.value,
      address_lng: lng.value
    })
  }
}

const saveAddress = () => {
  if (!canSave.value || lat.value === null || lng.value === null) return
  locateError.value = ''
  emit('save', {
    address_text: addressText.value.trim(),
    address_lat: lat.value,
    address_lng: lng.value
  })
}

watch(addressText, () => {
  if (lat.value === null || lng.value === null) return
  const text = addressText.value.trim()
  if (!text) return
  emit('change', {
    address_text: text,
    address_lat: lat.value,
    address_lng: lng.value
  })
})

const locateMe = () => {
  locateError.value = ''

  if (!process.client || !map) return
  if (!ready.value) return

  if (!window.isSecureContext) {
    locateError.value = 'Joylashuvni aniqlash uchun sahifa HTTPS orqali ochilishi kerak.'
    return
  }

  if (!navigator.geolocation) {
    locateError.value = 'Brauzer joylashuv funksiyasini qo‘llab-quvvatlamaydi.'
    return
  }

  locating.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const next = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }
      const L = (window as any).L
      await placeMarker(L, next)
      map.setView([next.lat, next.lng], 16)
      locating.value = false
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        locateError.value = 'Joylashuv ruxsati berilmagan. Browser/Telegram ichida location ruxsatini yoqing.'
      }
      else if (error.code === error.TIMEOUT) {
        locateError.value = 'Joylashuvni olish vaqti tugadi. Qayta urinib ko‘ring.'
      }
      else {
        locateError.value = 'Joylashuv aniqlanmadi. Internet va GPS holatini tekshirib qayta urinib ko‘ring.'
      }
      locating.value = false
    },
    { enableHighAccuracy: true, timeout: 12000 }
  )
}

onMounted(async () => {
  if (!mapEl.value) return
  const L = await loadLeaflet()

  const startLat = props.initialLat ?? 39.6542
  const startLng = props.initialLng ?? 66.9597

  map = L.map(mapEl.value, { zoomControl: true }).setView([startLat, startLng], props.initialLat ? 15 : 12)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  if (props.initialLat !== null && props.initialLng !== null) {
    void placeMarker(L, { lat: props.initialLat, lng: props.initialLng })
  }

  map.on('click', (e: any) => {
    void placeMarker(L, e.latlng)
  })

  ready.value = true
})
</script>

<template>
  <section class="ff-rise rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
    <p class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ props.label }}</p>
    <div ref="mapEl" class="mt-2 h-44 w-full overflow-hidden rounded-xl border border-slate-200" />
    <div v-if="ready && lat !== null && lng !== null" class="mt-2 text-xs text-slate-500">
      {{ lat }}, {{ lng }}
    </div>
    <UInput v-model="addressText" class="mt-2 w-full" :placeholder="props.label" />
    <p v-if="addressText" class="mt-2 break-words text-xs leading-5 text-slate-600">
      {{ addressText }}
    </p>
    <div class="mt-2 flex flex-wrap gap-2">
      <UButton
        color="neutral"
        variant="soft"
        :loading="locating"
        :disabled="props.loading || !ready"
        @click="locateMe"
      >
        {{ props.locateLabel }}
      </UButton>
      <UButton color="primary" :disabled="!canSave" :loading="props.loading" @click="saveAddress">
        {{ props.saveLabel }}
      </UButton>
    </div>
    <p v-if="locateError" class="mt-2 text-xs font-medium text-rose-600">
      {{ locateError }}
    </p>
  </section>
</template>
