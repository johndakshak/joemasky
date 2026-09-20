# Category API

Base path: `/categories`

---

## GET /categories

List all categories.

**Auth:** None

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Footwear",
      "createdAt": "2026-09-10T11:33:04.608Z",
      "updatedAt": "2026-09-10T11:33:04.608Z"
    }
  ]
}
```

---

## GET /categories/:id

Get a single category by ID.

**Auth:** None

**Response 200:** same shape as one item above.

**Errors:**
- `400` — `id` is not a valid number
- `404` — category not found

---

## POST /categories

Create a new category.

**Auth:** Admin required

**Body (JSON):**
| Field | Type | Required |
|---|---|---|
| name | string | yes (min 2 characters, case-insensitive unique) |

**Response 201:** created category.

**Errors:**
- `400` — name missing, too short, or not a string
- `409` — a category with this name already exists (case-insensitive)

---

## PATCH /categories/:id

Update a category's name.

**Auth:** Admin required

**Body (JSON):**
| Field | Type | Required |
|---|---|---|
| name | string | yes |

**Response 200:** updated category.

**Errors:**
- `400` — name missing, too short, or not a string
- `404` — category not found
- `409` — a category with this name already exists (case-insensitive)

---

## DELETE /categories/:id

Delete a category.

**Auth:** Admin required

**Response 200:**
```json
{ "success": true, "message": "Category deleted successfully" }
```

**Errors:**
- `404` — category not found
- `409` — cannot delete; category is referenced by existing products