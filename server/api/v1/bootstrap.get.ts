import { defineEventHandler } from 'h3'
import { ok } from '~~/server/utils/api'
import { requireUserContext } from '~~/server/utils/auth'
import { getSupabaseAdmin } from '~~/server/utils/supabase-admin'
import { isTelegramChatMember } from '~~/server/utils/telegram-dispatch'

export default defineEventHandler(async (event) => {
  const ctx = await requireUserContext(event)

  if (!ctx.roles.is_master) {
    const config = useRuntimeConfig(event)
    const mastersGroupId = Number(config.telegramMastersGroupId)
    if (config.telegramBotToken && mastersGroupId !== 0) {
      const supabase = getSupabaseAdmin(event)
      const { data: existingMaster } = await supabase
        .from('master_profiles')
        .select('user_id')
        .eq('user_id', ctx.user.id)
        .maybeSingle()

      if (!existingMaster) {
        const membership = await isTelegramChatMember(
          config.telegramBotToken,
          mastersGroupId,
          ctx.user.telegram_user_id
        )

        if (membership.ok && membership.isMember) {
          await supabase
            .from('master_profiles')
            .insert({
              user_id: ctx.user.id,
              approval_status: 'pending',
              is_active: false
            })
        }
      }
    }
  }

  return ok({
    user: ctx.user,
    roles: ctx.roles,
    config: {
      default_locale: 'uz_cyrl',
      max_dispatch_attempts: 3
    }
  })
})
