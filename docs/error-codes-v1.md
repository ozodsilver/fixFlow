# V1 Error Code Catalog

## Response format
```json
{
  "error": {
    "code": "dispatch.expired",
    "message": "Dispatch already expired",
    "details": {}
  }
}
```

## Codes
| Code | HTTP | Meaning | Client action |
|---|---:|---|---|
| `auth.invalid_init_data` | 401 | Telegram init data invalid (HMAC/freshness/replay) | Re-open Mini App |
| `auth.session_expired` | 401 | Session cookie expired or missing | Re-auth via `/auth/telegram/init` |
| `request.not_found` | 404 | Request/order/dispatch not found | Stop / refresh list |
| `request.not_owner` | 403 | Caller not owner of request | Stop |
| `request.not_dispatchable` | 409 | Intake not complete or invalid state for dispatch | Fix missing fields |
| `dispatch.expired` | 409 | Dispatch claim window expired | Request/preview refresh |
| `dispatch.already_claimed` | 409 | Another master already claimed | Close screen |
| `dispatch.claim_conflict` | 409 | Race or invalid dispatch/request state | Refresh and retry if allowed |
| `dispatch.max_attempts_exhausted` | 409 | Auto attempts exhausted (3 total) | Admin/manual path |
| `master.not_approved` | 403 | Master is not approved/active | Contact admin |
| `access.forbidden` | 403 | Role permission denied | Stop |
| `validation.failed` | 422 | Invalid input schema/value | Fix payload |
| `rate_limit.exceeded` | 429 | Rate limit hit | Retry with backoff |
| `idempotency.replayed` | 200/201 | Same idempotency key replayed, old response returned | Safe no-op |

## Notes
- `idempotency.replayed` should return the original success/error payload.
- For webhook duplicates, server may respond `200` with `ok=true` and log as replayed/ignored.
