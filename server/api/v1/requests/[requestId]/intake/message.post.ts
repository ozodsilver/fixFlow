import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { apiError, ok } from '~~/server/utils/api'
import { requireOwnedRequest } from '~~/server/utils/auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'
import { analyzeIntakeMessage, computeMissingFields } from '~~/server/utils/intake'

interface IntakeBody {
  text?: string
  idempotency_key?: string
}

const allowedStatuses = ['draft', 'intake_in_progress', 'ready_for_dispatch']

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const requestId = getRouterParam(event, 'requestId')
  const body = await readBody<IntakeBody>(event)

  if (!requestId) {
    apiError(422, 'validation.failed', 'requestId is required')
  }

  const text = body.text?.trim()
  if (!text) {
    apiError(422, 'validation.failed', 'text is required')
  }

  const { request } = await requireOwnedRequest(event, requestId)
  const supabase = getSupabaseAdmin(event)

  if (!allowedStatuses.includes(request.status)) {
    apiError(409, 'request.not_dispatchable', 'Intake is not allowed in current request state')
  }

  await supabase.from('request_intake_messages').insert({
    request_id: request.id,
    sender: 'user',
    message_text: text,
    field_patch: {}
  })

  const intakeResult = await analyzeIntakeMessage(
    {
      text,
      locale: request.locale,
      current: {
        domain_id: request.domain_id,
        issue_tag_id: request.issue_tag_id,
        issue_custom: request.issue_custom,
        problem_summary: request.problem_summary,
        phone_e164: request.phone_e164,
        address_text: request.address_text,
        address_lat: request.address_lat,
        address_lng: request.address_lng,
        landmark_text: request.landmark_text,
        urgency: request.urgency,
        visit_time_mode: request.visit_time_mode,
        visit_time_at: request.visit_time_at,
        consent_share: request.consent_share
      }
    },
    {
      geminiApiKey: config.geminiApiKey,
      geminiModel: config.geminiModel
    }
  )

  const merged = {
    domain_id: request.domain_id,
    issue_tag_id: request.issue_tag_id,
    issue_custom: request.issue_custom,
    problem_summary: request.problem_summary,
    phone_e164: request.phone_e164,
    address_text: request.address_text,
    address_lat: request.address_lat,
    address_lng: request.address_lng,
    landmark_text: request.landmark_text,
    urgency: request.urgency,
    visit_time_mode: request.visit_time_mode,
    visit_time_at: request.visit_time_at,
    consent_share: request.consent_share,
    ...intakeResult.updates
  }

  const missing = computeMissingFields(merged)
  const nextStatus = missing.length === 0 ? 'ready_for_dispatch' : 'intake_in_progress'

  const { data: updatedRequest, error: updateError } = await supabase
    .from('service_requests')
    .update({
      ...intakeResult.updates,
      status: nextStatus
    })
    .eq('id', request.id)
    .select('*')
    .single()

  if (updateError || !updatedRequest) {
    apiError(500, 'db.failed', 'Failed to update request intake', { reason: updateError?.message })
  }

  await supabase.from('request_intake_messages').insert({
    request_id: request.id,
    sender: 'ai',
    message_text: intakeResult.aiReply,
    field_patch: intakeResult.updates,
    validation_snapshot: {
      intent: intakeResult.intent,
      missing_required: missing,
      ready_for_dispatch: missing.length === 0
    },
    offtopic: intakeResult.intent === 'offtopic',
    abuse: intakeResult.intent === 'abuse'
  })

  return ok({
    ai_reply: intakeResult.aiReply,
    intent: intakeResult.intent,
    missing_required: missing,
    ready_for_dispatch: missing.length === 0,
    request: updatedRequest
  })
})
