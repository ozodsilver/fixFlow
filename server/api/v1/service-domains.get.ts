import { defineEventHandler } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireUserContext } from '~~/server/utils/auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async (event) => {
  await requireUserContext(event)
  const supabase = getSupabaseAdmin(event)

  const { data, error } = await supabase
    .from('service_domains')
    .select('id, slug, name_uz_cyrl, name_ru, is_active, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    apiError(500, 'db.failed', 'Failed to load service domains', { reason: error.message })
  }

  return ok(data || [])
})
