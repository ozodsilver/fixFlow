import type {
  ApiDataResponse,
  BootstrapData,
  DispatchReply,
  IntakeReply,
  IssueTag,
  RequestListData,
  ServiceDomain,
  ServiceRequest
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

export function useRequesterApi() {
  const initAuth = (body: InitAuthBody) =>
    $fetch<ApiDataResponse<{ session_expires_at: string; user: unknown; roles: unknown }>>('/api/v1/auth/telegram/init', {
      method: 'POST',
      body
    })

  const bootstrap = () => $fetch<ApiDataResponse<BootstrapData>>('/api/v1/bootstrap')

  const getServiceDomains = () => $fetch<ApiDataResponse<ServiceDomain[]>>('/api/v1/service-domains')

  const getIssueTags = (domainId: number) =>
    $fetch<ApiDataResponse<IssueTag[]>>(`/api/v1/service-domains/${domainId}/issue-tags`)

  const createRequest = (payload: { domain_id: number; locale: 'uz_cyrl' | 'ru' }) =>
    $fetch<ApiDataResponse<{ request_id: string; public_code: string; status: string }>>('/api/v1/requests', {
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

  const confirmIntake = (requestId: string) =>
    $fetch<ApiDataResponse<{ status: string; missing_required: string[] }>>(
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
    $fetch<ApiDataResponse<{ status: string }>>(`/api/v1/requests/${requestId}/cancel`, {
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
    postIntakeMessage,
    confirmIntake,
    dispatchRequest,
    cancelRequest
  }
}
