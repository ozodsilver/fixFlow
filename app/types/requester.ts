export type AppLocale = 'uz_cyrl' | 'ru'

export type RequestStatus =
  | 'draft'
  | 'intake_in_progress'
  | 'ready_for_dispatch'
  | 'dispatched'
  | 'in_fulfillment'
  | 'closed_completed'
  | 'closed_canceled_user'
  | 'closed_canceled_admin'
  | 'closed_unfulfilled'

export type RequiredFieldKey =
  | 'service_domain'
  | 'issue_type'
  | 'problem_summary'
  | 'phone'
  | 'address'
  | 'landmark'
  | 'urgency'
  | 'visit_time'
  | 'consent'

export type IntakeIntent = 'collect' | 'confirm' | 'ready' | 'offtopic' | 'abuse'
export type IntakeSender = 'user' | 'ai' | 'system'

export interface ApiErrorPayload {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface ApiErrorResponse {
  error: ApiErrorPayload
}

export interface ApiDataResponse<T> {
  data: T
}

export interface SessionUser {
  id: string
  telegram_user_id: number
  display_name: string
  username: string | null
  locale: AppLocale
}

export interface SessionRoles {
  is_master: boolean
  is_admin: boolean
}

export interface BootstrapData {
  user: SessionUser
  roles: SessionRoles
  config: {
    default_locale: AppLocale
    max_dispatch_attempts: number
  }
}

export interface ServiceDomain {
  id: number
  slug: string
  name_uz_cyrl: string
  name_ru: string
  is_active: boolean
  sort_order: number
}

export interface IssueTag {
  id: number
  domain_id: number
  slug: string
  name_uz_cyrl: string
  name_ru: string
  is_active: boolean
  sort_order: number
}

export interface ServiceRequest {
  id: string
  public_code: string
  status: RequestStatus
  domain_id: number
  issue_tag_id: number | null
  issue_custom: string | null
  problem_summary: string | null
  phone_e164: string | null
  address_text: string | null
  address_lat: number | null
  address_lng: number | null
  landmark_text: string | null
  urgency: 'low' | 'normal' | 'high' | 'emergency' | null
  visit_time_mode: 'asap' | 'scheduled' | null
  visit_time_at: string | null
  consent_share: boolean
  locale: AppLocale
  current_dispatch_attempt: number
  created_at: string
  updated_at: string
}

export interface IntakeReply {
  ai_reply: string
  intent: IntakeIntent
  missing_required: RequiredFieldKey[]
  ready_for_dispatch: boolean
  request: ServiceRequest
}

export interface IntakeMessage {
  id: number
  sender: IntakeSender
  message_text: string
  validation_snapshot: {
    intent?: IntakeIntent
    missing_required?: RequiredFieldKey[]
    ready_for_dispatch?: boolean
  } | null
  offtopic: boolean
  abuse: boolean
  created_at: string
}

export interface DispatchReply {
  request_id: string
  review_id?: string
  dispatch_id: string | null
  status: RequestStatus
  expires_at: string | null
  admin_review_required?: boolean
}

export interface RequestListData {
  items: ServiceRequest[]
}
