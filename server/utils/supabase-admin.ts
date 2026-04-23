import { createClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'
import { apiError } from './api'

export function getSupabaseAdmin(event: H3Event) {
  const config = useRuntimeConfig(event)
  const supabaseUrl = config.public.supabaseUrl
  const serviceRole = config.supabaseServiceRoleKey

  if (!supabaseUrl || !serviceRole) {
    apiError(500, 'config.missing', 'Supabase configuration is missing')
  }

  return createClient(supabaseUrl, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}
