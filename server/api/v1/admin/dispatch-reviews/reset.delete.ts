import { defineEventHandler } from 'h3'
import { ok, apiError } from '~~/server/utils/api'
import { requireAdminSession } from '~~/server/utils/admin-auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)
  const supabase = getSupabaseAdmin(event)
  const { error } = await supabase.from('admin_dispatch_reviews').delete().not('id', 'is', null)
  if (error) apiError(500, 'db.failed', 'Failed to reset dispatch reviews', { reason: error.message })
  return ok({ deleted: true })
})
