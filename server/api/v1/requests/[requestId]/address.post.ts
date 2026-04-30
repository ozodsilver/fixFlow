import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireOwnedRequest } from '~~/server/utils/auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

interface AddressBody {
  address_text?: string
  address_lat?: number
  address_lng?: number
}

const allowedStatuses = ['draft', 'intake_in_progress', 'ready_for_dispatch']

export default defineEventHandler(async (event) => {
  const requestId = getRouterParam(event, 'requestId')
  if (!requestId) {
    apiError(422, 'validation.failed', 'requestId is required')
  }

  const body = await readBody<AddressBody>(event)
  const addressText = body.address_text?.trim()
  const lat = body.address_lat
  const lng = body.address_lng

  if (!addressText || typeof lat !== 'number' || typeof lng !== 'number') {
    apiError(422, 'validation.failed', 'address_text, address_lat, address_lng are required')
  }
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    apiError(422, 'validation.failed', 'Invalid map coordinates')
  }

  const { request } = await requireOwnedRequest(event, requestId)
  if (!allowedStatuses.includes(request.status)) {
    apiError(409, 'request.not_dispatchable', 'Address update is not allowed in current request state')
  }

  const supabase = getSupabaseAdmin(event)

  const { data: updatedRequest, error } = await supabase
    .from('service_requests')
    .update({
      address_text: addressText,
      address_lat: lat,
      address_lng: lng
    })
    .eq('id', request.id)
    .select('*')
    .single()

  if (error || !updatedRequest) {
    apiError(500, 'db.failed', 'Failed to save address', { reason: error?.message })
  }

  await supabase.from('request_intake_messages').insert({
    request_id: request.id,
    sender: 'system',
    message_text: request.locale === 'ru' ? 'Адрес сохранен по карте.' : 'Манзил харита орқали сақланди.',
    field_patch: {
      address_text: addressText,
      address_lat: lat,
      address_lng: lng
    }
  })

  return ok({
    request: updatedRequest
  })
})
