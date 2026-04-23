# FixFlow Agent Instructions (V1)

## Product
Telegram Mini App service marketplace:
- requester enters bot and opens Mini App
- requester selects service domain and talks to intake AI
- AI collects structured fields and dispatches to Telegram masters group
- approved master claims request atomically
- order becomes admin-visible

## Frozen V1 Rules (do not redesign)
- Single city, single Telegram masters group.
- Roles: requester (implicit), master (approved), admin (manual).
- Service domain and issue tags are separate entities.
- Intake mode: strict structured intake with AI assistance.
- Mandatory fields before dispatch:
  - service domain
  - issue tag or issue custom type
  - short problem summary
  - phone
  - address
  - landmark when needed
  - urgency
  - visit time (`asap` or scheduled)
  - consent to share
- Photos optional. Voice/video out of scope.
- Privacy-first:
  - before claim: no full phone, no exact address
  - after successful atomic claim: full phone and exact address only to winning master
- Request is created first, order is created only after successful claim.
- User can cancel only before claim.
- Languages: Uzbek Cyrillic (default) and Russian.
- Price/payment out of scope for V1.
- Auth/security:
  - validate Telegram init data server-side
  - server-side authorization only
  - never trust client role claims
  - claim must be atomic and idempotent

## Tech Stack
- Nuxt 4 + Nuxt UI 4
- Tailwind CSS + SCSS
- Supabase (Postgres)
- Telegram Bot + Mini App
- GROQ for intake AI

## Architecture Boundaries
- Browser must call Nuxt server APIs only.
- Browser must not call Supabase directly.
- Supabase service role key must be server-only.
- Follow existing SQL/OpenAPI docs as source of truth:
  - `docs/openapi-v1.yaml`
  - `docs/state-machine-v1.md`
  - `docs/error-codes-v1.md`
  - `docs/privacy-consent-v1.md`

## Current Implementation Priority
Requester phase only:
- requester home screen
- requester intake chat screen
- requester request status screen
- i18n foundation (uz_cyrl default, ru)
- no master/admin UI in this phase

## Coding Rules For Agent
- Inspect first, then implement.
- Avoid hidden assumptions; list assumptions explicitly.
- Keep reusable clean structure (`components`, `composables`, `types`, `server/api`).
- Use typed API contracts; align with `openapi-v1.yaml`.
- Keep UI mobile-first for Telegram webview.
- Do not introduce mock-only architecture. If temporary mock is needed, mark it clearly and isolate.

## Definition Of Done (Requester Phase)
- UI routes exist and work.
- UI reads data through Nuxt server endpoints.
- i18n works with uz_cyrl default and ru switch.
- Loading/empty/error states exist on requester screens.
- No privacy rule violations in requester-visible data.
