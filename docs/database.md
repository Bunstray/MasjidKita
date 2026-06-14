# Database Schema

MasjidKita uses a PostgreSQL database hosted on Supabase. The database schema is automatically bootstrapped and created if it doesn't exist when the Express server starts.

## Tables

### 1. `users`
Stores admin accounts.
- `id` (UUID): Primary key.
- `email` (TEXT): Admin email address.
- `name` (TEXT): Full name.
- `password_hash` (TEXT): Bcrypt hashed password.
- `role` (TEXT): User role (e.g., 'admin').

### 2. `infaq`
Records digital infaq (donations).
- `id` (VARCHAR): Primary key (Format: `INF-YYYYMMDD-XXXXX`).
- `amount` (INTEGER): Donation amount in Rupiah.
- `donor_name` (VARCHAR): Name of the donor or 'Hamba Allah' if anonymous.
- `category` (VARCHAR): Donation category (e.g., 'Operasional', 'Pembangunan').
- `payment_method` (VARCHAR): Payment method used (e.g., 'Gopay', 'BCA').
- `payment_type` (VARCHAR): Type of payment ('qris', 'ewallet', 'bank').
- `status` (VARCHAR): Transaction status (usually 'success').
- `created_at` (TIMESTAMPTZ): Timestamp of the donation.

### 3. `news`
Stores news and announcements.
- `id` (SERIAL): Primary key.
- `title` (VARCHAR): News headline.
- `content` (TEXT): Full content of the news.
- `image_url` (VARCHAR): Optional URL for a cover image.
- `created_at` (TIMESTAMPTZ): Timestamp of publication.

### 4. `coupon_events`
Stores food coupon events created by the admin.
- `id` (SERIAL): Primary key.
- `description` (VARCHAR): Name/Description of the event (e.g., "Jumat Berkah").
- `total_quantity` (INTEGER): Total number of coupons available for this event.
- `valid_until` (TIMESTAMPTZ): Expiry date and time for the event.
- `created_by` (UUID): Foreign key referencing `users(id)`.
- `created_at` (TIMESTAMPTZ): Timestamp of event creation.

### 5. `coupons`
Stores individual coupon codes tied to an event.
- `id` (SERIAL): Primary key.
- `event_id` (INTEGER): Foreign key referencing `coupon_events(id)`. Cascades on delete.
- `code` (VARCHAR): Unique 50-character coupon code (Format: `MK-EVENT-XXXXX`).
- `is_claimed` (BOOLEAN): Claim status flag (Default: false).
- `claimed_at` (TIMESTAMPTZ): Timestamp of when the coupon was claimed.
- `claimed_by` (VARCHAR): Device ID (`x-device-id`) of the user who claimed it.

---

## Bootstrap Process
On server startup, `server/index.mjs` executes a `bootstrap()` function which runs `CREATE TABLE IF NOT EXISTS` commands for `coupon_events` and `coupons`. It also seeds a default admin account (`admin@masjidkita.id` / `admin123`) if no admin exists in the `users` table.
