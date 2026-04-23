interface IntakeCurrentState {
  domain_id: number | null
  issue_tag_id: number | null
  issue_custom: string | null
  problem_summary: string | null
  phone_e164: string | null
  address_text: string | null
  landmark_text: string | null
  urgency: 'low' | 'normal' | 'high' | 'emergency' | null
  visit_time_mode: 'asap' | 'scheduled' | null
  visit_time_at: string | null
  consent_share: boolean
}

export interface IntakeInput {
  text: string
  locale: 'uz_cyrl' | 'ru'
  current: IntakeCurrentState
}

export interface IntakeOutput {
  intent: 'collect' | 'confirm' | 'ready' | 'offtopic' | 'abuse'
  aiReply: string
  updates: Partial<IntakeCurrentState>
}

interface IntakeAiOptions {
  groqApiKey?: string
  groqModel?: string
}

interface GroqReplyPayload {
  intent?: string
  ai_reply?: string
  updates?: Record<string, unknown>
  offtopic?: boolean
  abuse?: boolean
}

const defaultReplies = {
  askFallback: {
    uz_cyrl: 'Илтимос, муаммони қисқача ёзинг ва хизматга тегишли маълумотни қолдиринг.',
    ru: 'Пожалуйста, кратко опишите проблему и оставьте данные по услуге.'
  },
  freeFlowAck: {
    uz_cyrl: 'Тушунарли. Қўшимча саволингиз ёки маълумотингизни ёзинг.',
    ru: 'Понятно. Можете написать дополнительный вопрос или детали.'
  }
} as const

function normalizePhone(raw: string): string | null {
  const clean = raw.replace(/[^\d+]/g, '')
  if (!clean) return null
  if (clean.startsWith('+') && /^\+[1-9][0-9]{7,14}$/.test(clean)) return clean
  if (/^998\d{9}$/.test(clean)) return `+${clean}`
  return null
}

function normalizeIssueCustom(raw: string): string | null {
  const value = raw
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\- ]/gu, '')
    .replace(/\s+/g, '_')
    .slice(0, 64)
  return value || null
}

function normalizeVisitTimeAt(raw: string): string | null {
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

function normalizeUrgency(raw: unknown): IntakeCurrentState['urgency'] {
  if (typeof raw !== 'string') return null
  if (raw === 'low' || raw === 'normal' || raw === 'high' || raw === 'emergency') return raw
  return null
}

function normalizeVisitMode(raw: unknown): IntakeCurrentState['visit_time_mode'] {
  if (typeof raw !== 'string') return null
  if (raw === 'asap' || raw === 'scheduled') return raw
  return null
}

function asShortText(raw: unknown, max: number): string | null {
  if (typeof raw !== 'string') return null
  const value = raw.trim().replace(/\s+/g, ' ').slice(0, max)
  return value || null
}

export function computeMissingFields(current: IntakeCurrentState) {
  void current
  return []
}

function buildPrompt(locale: 'uz_cyrl' | 'ru', missing: string[]) {
  if (missing.length === 0) {
    return locale === 'ru'
      ? 'Данные заполнены. Подтвердите и отправьте заявку мастерам.'
      : 'Маълумотлар тўлдирилди. Тасдиқлаб, сўровни усталарга юборинг.'
  }

  const next = missing[0]
  const uz: Record<string, string> = {
    service_domain: 'хизмат турини танланг',
    issue_type: 'муаммо турини аниқ айтинг',
    problem_summary: 'муаммони қисқача ёзинг',
    phone: 'телефон рақамингизни ёзинг',
    address: 'манзилни ёзинг',
    landmark: 'мўлжални ёзинг',
    urgency: 'шошилинчлик даражасини айтинг',
    visit_time: 'қайси вақтда келиш кераклигини ёзинг',
    consent: 'маълумотни устага беришга розиликни тасдиқланг'
  }
  const ru: Record<string, string> = {
    service_domain: 'выберите тип услуги',
    issue_type: 'уточните тип проблемы',
    problem_summary: 'кратко опишите проблему',
    phone: 'укажите номер телефона',
    address: 'укажите адрес',
    landmark: 'укажите ориентир',
    urgency: 'укажите срочность',
    visit_time: 'укажите удобное время',
    consent: 'подтвердите согласие на передачу данных мастерам'
  }

  return locale === 'ru' ? `Пожалуйста, ${ru[next]}.` : `Илтимос, ${uz[next]}.`
}

function inferIssueCustomFromText(raw: string): string | null {
  const text = raw.trim()
  const lower = text.toLowerCase()

  const explicitMatch = text.match(/(?:муаммо\s*тури|muammo\s*turi|тип\s*проблемы|issue\s*type)\s*[:\-]\s*(.+)$/i)
  if (explicitMatch?.[1]) {
    return normalizeIssueCustom(explicitMatch[1].slice(0, 64))
  }

  if (/(қувур|труба|pipe|shlang|шланг)/i.test(lower) && /(ёрил|yoril|прорв|burst|лопнул)/i.test(lower)) {
    return 'pipe_burst'
  }
  if (/(ҳожатхона|туалет|toilet|унитаз)/i.test(lower)) {
    return 'toilet_problem'
  }
  if (/(канализац|sewer|kanaliz)/i.test(lower)) {
    return 'sewer_issue'
  }
  if (/(сув|вода|water line|водопровод|вода линия)/i.test(lower)) {
    return 'water_line_issue'
  }

  return null
}

function fallbackAnalyze(input: IntakeInput): IntakeOutput {
  const text = input.text.trim()

  const updates: Partial<IntakeCurrentState> = {}

  const phoneMatch = text.match(/(\+?\d[\d\s\-()]{8,20})/)
  if (phoneMatch) {
    const phone = normalizePhone(phoneMatch[1])
    if (phone) updates.phone_e164 = phone
  }

  if (!input.current.problem_summary && text.length >= 10) {
    updates.problem_summary = text.slice(0, 240)
  }

  if (!input.current.address_text && /(кўча|улица|дом|уй|manzil|адрес)/i.test(text)) {
    updates.address_text = text.slice(0, 280)
  }

  if (!input.current.landmark_text && /(ориентир|мўлжал|mo'ljal)/i.test(text)) {
    updates.landmark_text = text.slice(0, 180)
  }

  if (!input.current.urgency) {
    if (/(срочно|urgent|шошилинч|тезда)/i.test(text)) updates.urgency = 'high'
    if (/(авария|emergency)/i.test(text)) updates.urgency = 'emergency'
    if (/(не срочно|оддий|обычно)/i.test(text)) updates.urgency = 'normal'
  }

  if (!input.current.visit_time_mode) {
    if (/(asap|тезроқ|срочно|сейчас)/i.test(text)) {
      updates.visit_time_mode = 'asap'
      updates.visit_time_at = null
    }
  }

  if (!input.current.consent_share && /(розиман|согласен|consent|разрешаю)/i.test(text)) {
    updates.consent_share = true
  }

  if (!input.current.issue_tag_id && !input.current.issue_custom) {
    const inferredIssue = inferIssueCustomFromText(text)
    if (inferredIssue) {
      updates.issue_custom = inferredIssue
    }
  }

  const merged = {
    ...input.current,
    ...updates
  }

  const missing = computeMissingFields(merged)
  return {
    intent: missing.length === 0 ? 'ready' : 'collect',
    aiReply: missing.length === 0 ? defaultReplies.freeFlowAck[input.locale] : buildPrompt(input.locale, missing),
    updates
  }
}

function sanitizeUpdates(
  updates: Record<string, unknown> | undefined,
  current: IntakeCurrentState
): Partial<IntakeCurrentState> {
  if (!updates || typeof updates !== 'object') {
    return {}
  }

  const normalized: Partial<IntakeCurrentState> = {}

  const issueCustomRaw = asShortText(updates.issue_custom ?? updates.issue_type ?? updates.problem_type, 64)
  if (issueCustomRaw) {
    normalized.issue_custom = normalizeIssueCustom(issueCustomRaw)
  }

  const summaryRaw = asShortText(updates.problem_summary, 240)
  if (summaryRaw) normalized.problem_summary = summaryRaw

  const addressRaw = asShortText(updates.address_text, 280)
  if (addressRaw) normalized.address_text = addressRaw

  const landmarkRaw = asShortText(updates.landmark_text, 180)
  if (landmarkRaw) normalized.landmark_text = landmarkRaw

  const phoneRaw = asShortText(updates.phone_raw ?? updates.phone_e164, 32)
  if (phoneRaw) {
    const phone = normalizePhone(phoneRaw)
    if (phone) normalized.phone_e164 = phone
  }

  const urgency = normalizeUrgency(updates.urgency)
  if (urgency) normalized.urgency = urgency

  const visitMode = normalizeVisitMode(updates.visit_time_mode)
  if (visitMode) normalized.visit_time_mode = visitMode

  const visitTimeAtRaw = asShortText(updates.visit_time_at, 64)
  if (visitMode === 'scheduled' && visitTimeAtRaw) {
    const iso = normalizeVisitTimeAt(visitTimeAtRaw)
    if (iso) normalized.visit_time_at = iso
  }

  if (visitMode === 'asap') {
    normalized.visit_time_at = null
  }

  if (typeof updates.consent_share === 'boolean') {
    normalized.consent_share = updates.consent_share
  }

  if (
    normalized.consent_share === undefined &&
    !current.consent_share &&
    typeof updates.consent_text === 'string' &&
    /(розиман|согласен|разрешаю|consent|ok)/i.test(updates.consent_text)
  ) {
    normalized.consent_share = true
  }

  return normalized
}

function toSafeIntent(raw: unknown, fallback: IntakeOutput['intent']): IntakeOutput['intent'] {
  if (raw === 'collect' || raw === 'confirm' || raw === 'ready' || raw === 'offtopic' || raw === 'abuse') {
    return raw
  }
  return fallback
}

function extractJsonObject(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  try {
    return JSON.parse(trimmed) as Record<string, unknown>
  }
  catch {
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start === -1 || end === -1 || end <= start) return null
    try {
      return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>
    }
    catch {
      return null
    }
  }
}

async function callGroq(input: IntakeInput, options: IntakeAiOptions): Promise<GroqReplyPayload | null> {
  const apiKey = options.groqApiKey?.trim()
  if (!apiKey) return null

  const missing = computeMissingFields(input.current)
  const localeLabel = input.locale === 'ru' ? 'ru' : 'uz_cyrl'

  const systemPrompt = [
    'You are an assistant in a home service request chat.',
    'Answer user questions naturally and briefly, then continue intake if required fields are still missing.',
    'Keep ai_reply short: maximum 2 short operational sentences.',
    'Collect/update only these fields: issue_custom, problem_summary, phone_raw, address_text, landmark_text, urgency, visit_time_mode, visit_time_at, consent_share.',
    'urgency must be one of: low, normal, high, emergency.',
    'visit_time_mode must be one of: asap, scheduled.',
    'Output JSON only with keys: intent, ai_reply, updates, offtopic, abuse.',
    'Do not invent data. If unsure, leave updates empty.'
  ].join('\n')

  const userPrompt = JSON.stringify(
    {
      locale: localeLabel,
      user_message: input.text,
      current_fields: input.current,
      missing_required: missing
    },
    null,
    2
  )

  const body = {
    model: options.groqModel || 'llama-3.1-8b-instant',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal: controller.signal
  }).finally(() => clearTimeout(timeout))

  if (!response.ok) {
    return null
  }

  const payload = await response.json() as {
    choices?: Array<{
      message?: {
        content?: string
      }
    }>
  }

  const content = payload.choices?.[0]?.message?.content || ''
  const parsed = extractJsonObject(content)
  if (!parsed) return null

  return parsed as GroqReplyPayload
}

function normalizeAiReply(raw: unknown, locale: 'uz_cyrl' | 'ru', missing: string[]) {
  const fallback = missing.length > 0 ? buildPrompt(locale, missing) : defaultReplies.askFallback[locale]
  if (typeof raw !== 'string') return fallback

  const text = raw.trim().replace(/\s+/g, ' ').slice(0, 220)
  return text || fallback
}

export async function analyzeIntakeMessage(input: IntakeInput, options: IntakeAiOptions = {}): Promise<IntakeOutput> {
  const text = input.text.trim()
  if (!text) {
    return {
      intent: 'collect',
      aiReply: buildPrompt(input.locale, computeMissingFields(input.current)),
      updates: {}
    }
  }

  const fallback = fallbackAnalyze(input)
  const groq = await callGroq(input, options)
  if (!groq) {
    return fallback
  }

  const groqIntent = toSafeIntent(groq.intent, fallback.intent)
  const updates = sanitizeUpdates(groq.updates, input.current)

  const merged = {
    ...input.current,
    ...updates
  }
  const missing = computeMissingFields(merged)

  const intent = missing.length === 0
    ? (groqIntent === 'confirm' ? 'confirm' : 'ready')
    : 'collect'
  return {
    intent,
    aiReply: normalizeAiReply(groq.ai_reply, input.locale, missing),
    updates
  }
}
