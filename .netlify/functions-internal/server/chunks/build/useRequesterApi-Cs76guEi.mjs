globalThis.__timing__.logStart('Load chunks/build/useRequesterApi-Cs76guEi');function useRequesterApi() {
  const initAuth = (body) => $fetch("/api/v1/auth/telegram/init", {
    method: "POST",
    body
  });
  const bootstrap = () => $fetch("/api/v1/bootstrap");
  const getServiceDomains = () => $fetch("/api/v1/service-domains");
  const getIssueTags = (domainId) => $fetch(`/api/v1/service-domains/${domainId}/issue-tags`);
  const createRequest = (payload) => $fetch("/api/v1/requests", {
    method: "POST",
    body: payload
  });
  const getRequests = () => $fetch("/api/v1/requests");
  const getRequest = (requestId) => $fetch(`/api/v1/requests/${requestId}`);
  const postIntakeMessage = (requestId, body) => $fetch(`/api/v1/requests/${requestId}/intake/message`, {
    method: "POST",
    body
  });
  const setAddressFromMap = (requestId, body) => $fetch(`/api/v1/requests/${requestId}/address`, {
    method: "POST",
    body
  });
  const submitStructuredIntake = (requestId, body) => $fetch(
    `/api/v1/requests/${requestId}/intake/structured`,
    {
      method: "POST",
      body
    }
  );
  const getIntakeMessages = (requestId, limit = 80) => $fetch(`/api/v1/requests/${requestId}/intake/messages`, {
    query: { limit }
  });
  const confirmIntake = (requestId) => $fetch(
    `/api/v1/requests/${requestId}/intake/confirm`,
    {
      method: "POST",
      body: { confirm: true }
    }
  );
  const dispatchRequest = (requestId, idempotencyKey) => $fetch(`/api/v1/requests/${requestId}/dispatch`, {
    method: "POST",
    body: { idempotency_key: idempotencyKey }
  });
  const cancelRequest = (requestId, reason) => $fetch(`/api/v1/requests/${requestId}/cancel`, {
    method: "POST",
    body: { reason }
  });
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
  };
}

export { useRequesterApi as u };;globalThis.__timing__.logEnd('Load chunks/build/useRequesterApi-Cs76guEi');
//# sourceMappingURL=useRequesterApi-Cs76guEi.mjs.map
