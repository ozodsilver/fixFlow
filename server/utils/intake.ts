interface IntakeInput {
  text: string
  locale: 'uz_cyrl' | 'ru'
  current: {
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
}

interface IntakeOutput {
  intent: 'collect' | 'confirm' | 'ready' | 'offtopic' | 'abuse'
  aiReply: string
  updates: Partial<IntakeInput['current']>
}

const offTopicPatterns = ['bitcoin', 'futbol', 'ob-havo', 'weather', 'movie', 'kino', 'music', 'hazil']

function normalizePhone(raw: string): string | null {
  const clean = raw.replace(/[^\d+]/g, '')
  if (!clean) return null
  if (clean.startsWith('+') && /^\+[1-9][0-9]{7,14}$/.test(clean)) return clean
  if (/^998\d{9}$/.test(clean)) return `+${clean}`
  return null
}

export function computeMissingFields(current: IntakeInput['current']) {
  const missing: string[] = []

  if (!current.domain_id) missing.push('service_domain')
  if (!current.issue_tag_id && !current.issue_custom) missing.push('issue_type')
  if (!current.problem_summary) missing.push('problem_summary')
  if (!current.phone_e164) missing.push('phone')
  if (!current.address_text) missing.push('address')
  if (current.address_text && current.address_text.length < 12 && !current.landmark_text) missing.push('landmark')
  if (!current.urgency) missing.push('urgency')
  if (!current.visit_time_mode) missing.push('visit_time')
  if (!current.consent_share) missing.push('consent')

  return missing
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

export function analyzeIntakeMessage(input: IntakeInput): IntakeOutput {
  const text = input.text.trim()
  const lower = text.toLowerCase()

  if (offTopicPatterns.some((token) => lower.includes(token))) {
    return {
      intent: 'offtopic',
      aiReply:
        input.locale === 'ru'
          ? 'Извините, я отвечаю только по вопросам услуг.'
          : 'Кечирасиз, мен фақат хизмат бўйича жавоб бераман.',
      updates: {}
    }
  }

  const updates: Partial<IntakeInput['current']> = {}

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
    if (/(қувур|труба|pipe)/i.test(text) && /(ёрил|прорв|burst)/i.test(text)) updates.issue_custom = 'pipe_burst'
    else if (/(ҳожатхона|туалет|toilet)/i.test(text)) updates.issue_custom = 'toilet_problem'
    else if (/(канализац|sewer)/i.test(text)) updates.issue_custom = 'sewer_issue'
    else if (/(сув|вода|water line)/i.test(text)) updates.issue_custom = 'water_line_issue'
  }

  const merged = {
    ...input.current,
    ...updates
  }

  const missing = computeMissingFields(merged)

  if (missing.length === 0) {
    return {
      intent: 'ready',
      aiReply: buildPrompt(input.locale, missing),
      updates
    }
  }

  return {
    intent: 'collect',
    aiReply: buildPrompt(input.locale, missing),
    updates
  }
}
