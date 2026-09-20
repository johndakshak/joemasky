# Admin API

Base path: `/admin`

Two roles: `ADMIN` and `SUPER_ADMIN`. Registration requires an invite token — there is no public sign-up.

---

## POST /admin/register

Register a new admin using an invite token.

**Auth:** None (but requires a valid, unused, unexpired invite token)

**Body (JSON):**
| Field | Type | Required |
|---|---|---|
| name | string | yes (min 2 characters) |
| email | string | yes (valid email format) |
| password | string | yes (min 8 chars, upper + lower + number + symbol) |
| inviteToken | string | yes |

**Response 201:**
```json
{
  "success": true,
  "data": { "id": 2, "name": "Jane", "email": "jane@example.com", "role": "ADMIN" }
}
```

**Errors:**
- `400` — validation failure, invalid/expired/already-used invite token
- `409` — email already registered

---

## POST /admin/login

Log in as an admin.

**Auth:** None. Rate-limited (5 attempts / 15 minutes per IP).

**Body (JSON):** `{ "email": "...", "password": "..." }`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "<JWT>",
    "admin": { "id": 1, "name": "John", "email": "john@joemasky.com", "role": "SUPER_ADMIN" }
  }
}
```

**Errors:**
- `400` — missing email/password
- `401` — invalid email or password, or account is frozen (same generic message for all three, to avoid leaking which is true)
- `429` — too many login attempts, try again later

---

## POST /admin/invites

Generate an invite (token expires in 15 minutes, single use).

**Auth:** Super admin required

**Response 201:**
```json
{ "success": true, "data": { "token": "a5cc98f9-...", "expiresAt": "2026-09-14T15:35:25.457Z" } }
```

---

## PATCH /admin/:id/freeze

Freeze another admin's account (they can no longer log in).

**Auth:** Super admin required

**Errors:**
- `400` — invalid ID, or trying to freeze your own account
- `404` — admin not found

---

## PATCH /admin/:id/unfreeze

Reactivate a frozen admin's account.

**Auth:** Super admin required

**Errors:**
- `400` — invalid ID
- `404` — admin not found

---

## All product/category write endpoints (`POST`, `PATCH`, `DELETE`)

Require `Authorization: Bearer <token>` from a valid, active admin (either role).