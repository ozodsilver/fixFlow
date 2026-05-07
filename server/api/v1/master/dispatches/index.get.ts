import { defineEventHandler } from 'h3'
import { ok } from '~~/server/utils/api'
import { requireMasterContext } from '~~/server/utils/master-auth'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireMasterContext(event)

  const { data, error } = await supabase
    .from('dispatch_records')
    .select(`
      id, status, expires_at, created_at,
      service_requests!dispatch_records_request_id_fkey(
        public_code, problem_summary, urgency, visit_time_mode, visit_time_at
      )
    `)
    .eq('status', 'open')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return ok({ items: [] })
  }

  const items = (data || []).map((d) => {
    const req = Array.isArray(d.service_requests) ? d.service_requests[0] : d.service_requests
    return {
      id: d.id,
      status: d.status,
      expires_at: d.expires_at,
      created_at: d.created_at,
      request: req
        ? {
            public_code: req.public_code,
            problem_summary: req.problem_summary,
            urgency: req.urgency,
            visit_time_mode: req.visit_time_mode,
            visit_time_at: req.visit_time_at
          }
        : null
    }
  })

  return ok({ items })
})
