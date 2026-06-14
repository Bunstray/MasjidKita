# Digital Infaq

The Digital Infaq feature provides a seamless and secure way for congregants to make donations (infaq/sadaqah) online.

## Architecture & Flow

### 1. User Interface
- Users select an amount, category (Operasional, Pembangunan, Yatim), and payment method (Gopay, OVO, QRIS, BCA, etc.).
- Users have the option to donate anonymously by leaving the "Nama" field blank, which defaults to "Hamba Allah".
- An interactive receipt is displayed upon successful donation using Framer Motion animations.

### 2. Frontend State & Persistence
- To allow users to view their donation history without requiring a user account, the frontend utilizes `localStorage`.
- All successful donations are saved to an array under the `masjidkita_infaq_receipts` key.
- The `InfaqHistory` page reads this LocalStorage to display a chronological list of past donations.

### 3. Backend Tracking
- When a donation is made, the frontend sends a `POST` request to `/api/infaq` to record the transaction in the Supabase PostgreSQL database.
- The API expects the following payload: `id` (a generated receipt ID like `INF-20260614-A3X9K`), `amount`, `donorName`, `category`, `paymentMethod`, `paymentType`, and `status`.

### 4. Admin Dashboard
- Admins can log into the secure dashboard to view all aggregated infaq statistics.
- The `GET /api/admin/infaq` endpoint calculates the total collected funds, the number of transactions, and fetches the latest transactions.
- This allows the mosque administrators to maintain complete financial transparency and tracking.

## Future Improvements
- **Payment Gateway Integration**: Currently, the system assumes successful payment via direct transfer. In the future, this can be integrated with Midtrans or Xendit for automated payment verification via Webhooks.
