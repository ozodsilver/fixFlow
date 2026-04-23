import type { BootstrapData } from '~/types/requester'

export function useSessionBootstrap() {
  const api = useRequesterApi()

  const session = useState<BootstrapData | null>('session-bootstrap', () => null)
  const loading = useState<boolean>('session-bootstrap-loading', () => false)
  const error = useState<string | null>('session-bootstrap-error', () => null)

  const refresh = async () => {
    loading.value = true
    error.value = null

    try {
      const res = await api.bootstrap()
      session.value = res.data
    }
    catch (err: unknown) {
      session.value = null
      error.value = (err as { data?: { error?: { message?: string } } })?.data?.error?.message ?? 'auth.session_expired'
      throw err
    }
    finally {
      loading.value = false
    }
  }

  return {
    session,
    loading,
    error,
    refresh
  }
}
