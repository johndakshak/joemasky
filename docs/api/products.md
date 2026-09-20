# Product API

Base path: `/products`

---

## GET /products

List all products, including their category.

**Auth:** None

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Shoe",
      "description": null,
      "price": "100",
      "isAvailable": true,
      "imageUrl": "https://res.cloudinary.com/.../shoe.png",
      "categoryId": 1,
      "category": { "id": 1, "name": "Footwear" },
      "createdAt": "2026-09-17T11:28:38.497Z",
      "updatedAt": "2026-09-17T11:28:38.497Z"
    }
  ]
}
```

---

## GET /products/:id

Get a single product by ID.

**Auth:** None

**Response 200:** same shape as one item above.

**Errors:**
- `400` — `id` is not a valid number
- `404` — product not found

---

## POST /products

Create a new product. Requires an image upload.

**Auth:** Admin required (`Authorization: Bearer <token>`)

**Body (multipart/form-data):**
| Field | Type | Required |
|---|---|---|
| name | string | yes |
| price | number | yes |
| categoryId | number | yes |
| description | string | no |
| isAvailable | boolean | no (defaults to `true`) |
| image | file | yes |

**Response 201:** created product, same shape as `GET /products/:id`.

**Errors:**
- `400` — missing/invalid field, or missing image
- `404` — `categoryId` does not exist

---

## PATCH /products/:id

Update a product. All fields optional — only provided fields are changed. Image is optional; if omitted, the existing image is kept.

**Auth:** Admin required

**Body (multipart/form-data):** same fields as create, all optional.

**Response 200:** updated product.

**Errors:**
- `400` — invalid field value
- `404` — product not found, or `categoryId` does not exist

---

## DELETE /products/:id

Delete a product.

**Auth:** Admin required

**Response 200:**
```json
{ "success": true, "message": "Product deleted successfully" }
```

**Errors:**
- `404` — product not found
- `409` — cannot delete; product is referenced by existing orders