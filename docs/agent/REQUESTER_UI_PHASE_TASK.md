# Task Brief: Requester UI Phase (V1)

## Goal
Implement requester side only:
- home screen
- intake chat screen
- request status screen

## Must Follow
- No direct Supabase calls from browser.
- UI calls Nuxt server API routes only.
- No master/admin UI in this phase.
- Use existing OpenAPI and error code docs.
- Uzbek Cyrillic default, Russian secondary.

## Build Checklist
1. Create route structure:
- `/requester`
- `/requester/requests/:requestId/intake`
- `/requester/requests/:requestId/status`

2. Create shared components:
- `AppHeader`
- `ServiceDomainCard`
- `ChatMessageBubble`
- `ChatComposer`
- `IntakeProgressHint`
- `RequestSummaryCard`
- `LoadingState`
- `EmptyState`
- `ErrorState`

3. Create i18n foundation:
- locale files for `uz_cyrl`, `ru`
- locale switching helper
- default locale `uz_cyrl`

4. Create requester-focused types:
- domain models
- request/intake models
- API response wrappers
- error code types

5. Create Nuxt server API skeletons (requester only):
- `POST /api/v1/auth/telegram/init`
- `GET /api/v1/bootstrap`
- `GET /api/v1/service-domains`
- `GET /api/v1/service-domains/:domainId/issue-tags`
- `POST /api/v1/requests`
- `GET /api/v1/requests`
- `GET /api/v1/requests/:requestId`
- `POST /api/v1/requests/:requestId/intake/message`
- `POST /api/v1/requests/:requestId/intake/confirm`
- `POST /api/v1/requests/:requestId/dispatch`
- `POST /api/v1/requests/:requestId/cancel`

6. Wire UI to API composables:
- loading/empty/error states
- off-topic refusal state
- missing required fields state
- ready-for-dispatch state

## Acceptance Criteria
- Requester screens work end-to-end with Nuxt server API interfaces.
- i18n toggles between `uz_cyrl` and `ru`.
- UI is mobile-first and Telegram-friendly.
- No privacy rule violations.
- No architecture rule violations.
