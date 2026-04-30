import type {
  ApiDataResponse,
  BootstrapData,
  DispatchReply,
  IntakeMessage,
  IntakeReply,
  IssueTag,
  RequestListData,
  RequestStatus,
  ServiceDomain,
  ServiceRequest,
  SessionRoles,
  SessionUser,
  RequiredFieldKey
} from '~/types/requester'

interface InitAuthBody {
  init_data?: string
  locale?: 'uz_cyrl' | 'ru'
  telegram_user_id?: number
  display_name?: string
}

interface IntakeBody {
  text: string
  idempotency_key: string
}

interface MapAddressBody {
  address_text: string
  address_lat: number
  address_lng: number
}

interface StructuredIntakeBody {
  phone: string
  problem_summary: string
  visit_time_at: string
  address_text: string
  address_lat: number
  address_lng: number
}

export function useRequesterApi() {
  const initAuth = (body: InitAuthBody) =>
    $fetch<ApiDataResponse<{ session_expires_at: string; user: SessionUser; roles: SessionRoles }>>('/api/v1/auth/telegram/init', {
      method: 'POST',
      body
    })

  const bootstrap = () => $fetch<ApiDataResponse<BootstrapData>>('/api/v1/bootstrap')

  const getServiceDomains = () => $fetch<ApiDataResponse<ServiceDomain[]>>('/api/v1/service-domains')

  const getIssueTags = (domainId: number) =>
    $fetch<ApiDataResponse<IssueTag[]>>(`/api/v1/service-domains/${domainId}/issue-tags`)

  const createRequest = (payload: { domain_id: number; locale: 'uz_cyrl' | 'ru' }) =>
    $fetch<ApiDataResponse<{ request_id: string; public_code: string; status: RequestStatus }>>('/api/v1/requests', {
      method: 'POST',
      body: payload
    })

  const getRequests = () => $fetch<ApiDataResponse<RequestListData>>('/api/v1/requests')

  const getRequest = (requestId: string) =>
    $fetch<ApiDataResponse<ServiceRequest>>(`/api/v1/requests/${requestId}`)

  const postIntakeMessage = (requestId: string, body: IntakeBody) =>
    $fetch<ApiDataResponse<IntakeReply>>(`/api/v1/requests/${requestId}/intake/message`, {
      method: 'POST',
      body
    })

  const setAddressFromMap = (requestId: string, body: MapAddressBody) =>
    $fetch<ApiDataResponse<{ request: ServiceRequest }>>(`/api/v1/requests/${requestId}/address`, {
      method: 'POST',
      body
    })

  const submitStructuredIntake = (requestId: string, body: StructuredIntakeBody) =>
    $fetch<ApiDataResponse<{ ai_reply: string; request: ServiceRequest; dispatch_id: string; expires_at: string }>>(
      `/api/v1/requests/${requestId}/intake/structured`,
      {
        method: 'POST',
        body
      }
    )

  const getIntakeMessages = (requestId: string, limit = 80) =>
    $fetch<ApiDataResponse<{ items: IntakeMessage[] }>>(`/api/v1/requests/${requestId}/intake/messages`, {
      query: { limit }
    })

  const confirmIntake = (requestId: string) =>
    $fetch<ApiDataResponse<{ status: RequestStatus; missing_required: RequiredFieldKey[] }>>(
      `/api/v1/requests/${requestId}/intake/confirm`,
      {
        method: 'POST',
        body: { confirm: true }
      }
    )

  const dispatchRequest = (requestId: string, idempotencyKey: string) =>
    $fetch<ApiDataResponse<DispatchReply>>(`/api/v1/requests/${requestId}/dispatch`, {
      method: 'POST',
      body: { idempotency_key: idempotencyKey }
    })

  const cancelRequest = (requestId: string, reason?: string) =>
    $fetch<ApiDataResponse<{ status: RequestStatus; admin_review_required: boolean }>>(`/api/v1/requests/${requestId}/cancel`, {
      method: 'POST',
      body: { reason }
    })

  return {
    initAuth,
    bootstrap,
    getServiceDomains,
    getIssueTags,
    createRequest,
    getRequests,
    getRequest,
    getIntakeMessages,
    postIntakeMessage,
    setAddressFromMap,
    submitStructuredIntake,
    confirmIntake,
    dispatchRequest,
    cancelRequest
  }
}
