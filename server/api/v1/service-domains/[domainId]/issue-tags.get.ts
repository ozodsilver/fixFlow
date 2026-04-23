import { defineEventHandler, getRouterParam } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireUserContext } from '~~/server/utils/auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async (event) => {
  await requireUserContext(event)
  const supabase = getSupabaseAdmin(event)

  const domainId = Number(getRouterParam(event, 'domainId'))
  if (!domainId) {
    apiError(422, 'validation.failed', 'domainId is invalid')
  }

  const { data, error } = await supabase
    .from('issue_tags')
    .select('id, domain_id, slug, name_uz_cyrl, name_ru, is_active, sort_order')
    .eq('domain_id', domainId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    apiError(500, 'db.failed', 'Failed to load issue tags', { reason: error.message })
  }

  return ok(data || [])
})
