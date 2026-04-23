# V1 State Machine Implementation Design

## 1) Enforcement split

### Enforced in DB (hard invariants)
- `orders.request_id` is unique (one order per request).
- Only one open dispatch per request (`uq_dispatch_open_per_request`).
- Only one current assignment per order (`uq_order_assignments_current`).
- Claim field consistency checks in `dispatch_records`.
- Terminal-state immutability guards for request/order (`trg_guard_*_terminal_transition`).
- Atomic claim logic in `rpc_claim_dispatch` (locking + idempotency + write set).

### Enforced in server code (business transitions)
- Request lifecycle transitions except claim-critical path.
- Dispatch creation, send retry, expiry handling, max attempts.
- Order status progress (`accepted -> in_progress -> completed`).
- Admin flows: reassignment, manual cancel, reopen dispatch.
- Mandatory intake field validation before dispatch.

## 2) Source of truth boundary
- `service_requests`: intake + dispatch + top-level closure.
- `orders`: fulfillment state once first claim succeeds.
- On first successful claim, request moves to `in_fulfillment` and order is created.
- While order is active, fulfillment transitions are driven from `orders` and mirrored to request only on terminal close.

## 3) Atomic claim RPC contract

Function: `rpc_claim_dispatch(p_dispatch_id, p_master_user_id, p_idempotency_key, p_request_hash, p_ip, p_user_agent)`

### Transaction steps
1. Reserve/check idempotency key (`master.claim_dispatch`).
2. Validate master approval (`approved + active`).
3. Lock dispatch row (`FOR UPDATE`).
4. Reject if not `open`, expired, or already claimed.
5. Lock request row (`FOR UPDATE`) and require `status = dispatched`.
6. Lock/create order:
   - Create with `accepted` on first claim.
   - If exists, only `reassignment_pending -> accepted` allowed.
7. Ensure no current active assignment.
8. Insert `order_assignments(active, is_current=true)`.
9. Update `dispatch_records -> claimed`.
10. Update `service_requests -> in_fulfillment`.
11. Write `status_history` and `audit_logs`.
12. Persist response snapshot in `idempotency_keys`.

### Deterministic error outputs from RPC
- `master.not_approved`
- `request.not_found`
- `dispatch.expired`
- `dispatch.already_claimed`
- `dispatch.claim_conflict`
- `validation.failed`

## 4) Status transition rules (implementation)

### service_requests.status
- `draft -> intake_in_progress | closed_canceled_user`
- `intake_in_progress -> ready_for_dispatch | closed_canceled_user`
- `ready_for_dispatch -> dispatched | closed_canceled_user`
- `dispatched -> in_fulfillment | closed_unfulfilled | closed_canceled_user | closed_canceled_admin`
- `in_fulfillment -> closed_completed | closed_canceled_admin`
- `closed_*` terminal

### orders.status
- `accepted -> in_progress | reassignment_pending | canceled_admin`
- `in_progress -> completed | reassignment_pending | canceled_admin`
- `reassignment_pending -> accepted | canceled_admin`
- `completed` terminal
- `canceled_admin` terminal

### dispatch_records.status
- `pending_send -> open | failed_send | canceled`
- `open -> claimed | expired | canceled`
- `failed_send -> pending_send | canceled`
- `claimed` terminal
- `expired` terminal
- `canceled` terminal

### order_assignments.status
- `active -> canceled_by_master | released_by_admin | completed`
- others terminal

## 5) Dispatch expiry and re-dispatch
- Default expiry: 15 minutes from dispatch open.
- Auto redispatch only before first claim.
- Max attempts total: 3 (1 initial + 2 retry).
- After first claim (order exists), reassignment dispatch is admin-manual in V1.
