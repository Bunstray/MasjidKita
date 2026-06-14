# Backend API Reference

Base URL: `/api`

All routes require a valid JSON Web Token (JWT) in the `Authorization: Bearer <token>` header for admin endpoints.

---

## Authentication

### `POST /auth/login`
Authenticates an admin user.
- **Body**: `{ email, password }`
- **Response**: `{ success: true, token, user: { id, name, email, role } }`

---

## News & Announcements

### `GET /news`
Fetches all news articles ordered by creation date.
- **Response**: `{ success: true, data: [ { id, title, content, image_url, created_at } ] }`

### `GET /news/:id`
Fetches a single news article by ID.
- **Response**: `{ success: true, data: { id, title, content, image_url, created_at } }`

### `POST /admin/news` (Requires Auth)
Creates a new news article.
- **Body**: `{ title, content, imageUrl }`
- **Response**: `{ success: true, data: { id, ... } }`

### `DELETE /admin/news/:id` (Requires Auth)
Deletes a news article by ID.
- **Response**: `{ success: true }`

---

## Digital Infaq

### `POST /infaq`
Records a new digital donation.
- **Body**: `{ id, amount, donorName, category, paymentMethod, paymentType, status }`
- **Response**: `{ success: true }`

### `GET /admin/infaq` (Requires Auth)
Fetches aggregated infaq statistics and recent transactions.
- **Response**: `{ success: true, total: number, count: number, transactions: [ ... ] }`

---

## E-Kupon

### `GET /admin/coupons` (Requires Auth)
Lists all coupon events and their aggregated claim statistics.
- **Response**: `{ success: true, data: [ { id, description, totalQuantity, validUntil, createdAt, totalCodes, claimedCount } ] }`

### `GET /admin/coupons/:eventId` (Requires Auth)
Fetches event details along with the list of all its individual coupon codes.
- **Response**: `{ success: true, data: { id, description, ..., coupons: [ { id, code, isClaimed, claimedAt, claimedBy } ] } }`

### `POST /admin/coupons` (Requires Auth)
Creates a new coupon event and automatically generates unique coupon codes.
- **Body**: `{ description, quantity, validUntil }`
- **Response**: `{ success: true, data: { id, description, total_quantity, codes: [...] } }`

### `DELETE /admin/coupons/:eventId` (Requires Auth)
Deletes a coupon event and all associated coupons.
- **Response**: `{ success: true }`

### `POST /coupons/claim`
Claims a specific unique coupon code.
- **Headers**: `x-device-id: <uuid>`
- **Body**: `{ code }`
- **Response**: `{ success: true, data: { code, description, validUntil, claimedAt } }`

### `POST /coupons/claim-event`
Claims the next available coupon for a specific event using device tracking.
- **Headers**: `x-device-id: <uuid>`
- **Body**: `{ eventId }`
- **Response**: `{ success: true, data: { code, description, validUntil, claimedAt } }`
- **Errors**: `409 Conflict` if the device already claimed a coupon for this event. `410 Gone` if the event is out of stock.

### `GET /coupons/verify/:code`
Verifies the status and validity of a specific coupon code.
- **Response**: `{ success: true, data: { code, description, isClaimed, claimedAt, validUntil, isExpired } }`
