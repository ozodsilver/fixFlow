import { randomBytes } from 'node:crypto'
import { defineEventHandler, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireUserContext } from '~~/server/utils/auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

interface CreateRequestBody {
  domain_id?: number
  locale?: 'uz_cyrl' | 'ru'
}

function createPublicCode() {
  return `SR-${randomBytes(3).toString('hex').toUpperCase()}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateRequestBody>(event)
  const { user } = await requireUserContext(event)
  const supabase = getSupabaseAdmin(event)

  if (!body.domain_id) {
    apiError(422, 'validation.failed', 'domain_id is required')
  }

  const { data: domain } = await supabase
    .from('service_domains')
    .select('id')
    .eq('id', body.domain_id)
    .eq('is_active', true)
    .maybeSingle()

  if (!domain) {
    apiError(422, 'validation.failed', 'Invalid service domain')
  }

  let inserted = null
  let attempts = 0

  while (!inserted && attempts < 5) {
    attempts += 1
    const publicCode = createPublicCode()

    const { data, error } = await supabase
      .from('service_requests')
      .insert({
        public_code: publicCode,
        requester_id: user.id,
        domain_id: body.domain_id,
        locale: body.locale === 'ru' ? 'ru' : 'uz_cyrl',
        status: 'draft'
      })
      .select('id, public_code, status')
      .single()

    if (!error && data) {
      inserted = data
      break
    }

    if (error && !error.message.toLowerCase().includes('public_code')) {
      apiError(500, 'db.failed', 'Failed to create request', { reason: error.message })
    }
  }

  if (!inserted) {
    apiError(500, 'db.failed', 'Failed to generate unique request code')
  }

  return ok({
    request_id: inserted.id,
    public_code: inserted.public_code,
    status: inserted.status
  })
})
