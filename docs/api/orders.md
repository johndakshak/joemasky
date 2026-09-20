# Order API

Two audiences: **customers** (no auth, identified by `publicToken`) and **admins** (`requireAdmin`).

---

## Customer-Facing Endpoints

### POST /orders

Create an order. No account needed.

**Auth:** None

**Body (JSON):**
| Field | Type | Required |
|---|---|---|
| customerName | string | yes (min 2 characters) |
| customerPhone | string | yes (Nigerian format: local `0...` or international `+234...`) |
| deliveryMethod | `"PICKUP"` \| `"DELIVERY"` | yes |
| deliveryInfo | string | required only if `deliveryMethod` is `DELIVERY` |
| items | array of `{ productId, quantity }` | yes, non-empty |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "publicToken": "7f5d02da-...",
    "customerName": "John Doe",
    "customerPhone": "+2348123456819",
    "deliveryMethod": "PICKUP",
    "deliveryInfo": null,
    "status": "PENDING",
    "items": [ { "id": 1, "productName": "Shoe", "unitPrice": "100", "quantity": 2, "availability": "AVAILABLE" } ],
    "totalAmount": 200,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:**
- `400` — invalid/missing field, malformed items, or one or more `productId`s don't exist

---

### GET /orders/:publicToken

Fetch an order using its private link.

**Auth:** None — the token itself is the access control. No endpoint exists to list all orders.

**Response 200:** same shape as create's response, including `totalAmount` (sum of only `AVAILABLE` items).

**Errors:**
- `404` — no order matches this token

---

### POST /order/:publicToken/accept

Accept a `PARTIALLY_CONFIRMED` order (proceed with the available items).

**Auth:** None

**Response 200:** order, now `CONFIRMED`.

**Errors:**
- `404` — order not found
- `409` — order is not currently `PARTIALLY_CONFIRMED`

---

### POST /order/:publicToken/decline

Decline a `PARTIALLY_CONFIRMED` order (cancel it entirely).

**Auth:** None

**Response 200:** order, now `CANCELLED`.

**Errors:**
- `404` — order not found
- `409` — order is not currently `PARTIALLY_CONFIRMED`

---

### GET /order/:publicToken/contact-shop

Get ready-to-use contact links (WhatsApp, call, SMS) pre-filled with a message about this order.

**Auth:** None

**Response 200:**
```json
{
  "success": true,
  "data": {
    "whatsapp": "https://wa.me/234.../?text=...",
    "call": "tel:+234...",
    "sms": "sms:+234...?body=..."
  }
}
```

**Errors:**
- `404` — order not found

---

## Admin Endpoints

### GET /admin/Orders

List all orders, newest first.

**Auth:** Admin required

**Response 200:** array of orders, each including `totalAmount`.

---

### GET /admin/order/:id

Get a single order by internal ID.

**Auth:** Admin required

**Errors:**
- `400` — invalid ID
- `404` — order not found

---

### PATCH /admin/orderStatus/:id

Update an order's status. Enforced by a transition map — not every status change is allowed.

**Auth:** Admin required

**Body (JSON):** `{ "status": "CONFIRMED" }` — one of `PENDING`, `PARTIALLY_CONFIRMED`, `CONFIRMED`, `PROCESSING`, `COMPLETED`, `CANCELLED`, `UNAVAILABLE`

**Valid transitions:**
| From | To |
|---|---|
| PENDING | CONFIRMED, PARTIALLY_CONFIRMED, CANCELLED, UNAVAILABLE |
| PARTIALLY_CONFIRMED | CONFIRMED, CANCELLED |
| CONFIRMED | PROCESSING, CANCELLED |
| PROCESSING | COMPLETED, CANCELLED |
| UNAVAILABLE | CANCELLED |
| COMPLETED | (final) |
| CANCELLED | (final) |

**Errors:**
- `400` — invalid status value
- `404` — order not found
- `409` — status is unchanged, or the transition isn't allowed

---

### PATCH /:orderId/items/:itemId/availability

Mark a single order item as available/unavailable. Only allowed while the order is `PENDING` or `UNAVAILABLE`.

**Auth:** Admin required

**Body (JSON):** `{ "availability": "AVAILABLE" | "UNAVAILABLE" }`

**Errors:**
- `400` — invalid IDs, missing body, or invalid availability value
- `404` — item not found, or item does not belong to the given order
- `409` — order is not in a reviewable state (status changed mid-request)

---

### POST /:orderId/review-orders

Recalculate an order's overall status based on its items' availability: all available → `CONFIRMED`, all unavailable → `UNAVAILABLE`, mixed → `PARTIALLY_CONFIRMED`.

**Auth:** Admin required

**Errors:**
- `400` — order has no items
- `404` — order not found