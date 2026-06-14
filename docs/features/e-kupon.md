# E-Kupon (Food Coupons)

The E-Kupon feature allows the mosque admin to distribute digital food coupons to congregants effectively and securely.

## Distribution Architecture

The system uses a **Single-QR Event Distribution** model. Instead of generating and printing individual QR codes for every single coupon, the system generates a single "Master" QR code for an entire event. 

### The Flow
1. **Event Creation**: Admin creates an event (e.g., "Jumat Berkah") and specifies the quantity of coupons (e.g., 50). The system generates 50 unique codes in the database.
2. **Master QR Code**: Admin clicks "Cetak QR Event" which produces a single QR code encoding the Event ID (e.g., `EVENT:5`). Admin prints and displays this QR code at the mosque.
3. **Congregant Claim**: Congregants open the MasjidKita app, navigate to E-Kupon -> Scan QR, and scan the Master QR code.
4. **Smart Assignment**: The backend receives the scan, verifies the event is active, and automatically assigns one of the 50 available unique coupon codes to that congregant.
5. **Redemption**: The congregant shows their digital coupon screen (which features an animation and live timestamp to prevent screenshots) to the food station staff to redeem their meal.

## Double-Claim Prevention (`x-device-id`)

To ensure fair distribution, the system must prevent users from scanning the Master QR code multiple times to hoard coupons. 

Because many congregants may be connected to the same mosque Wi-Fi (sharing the same IP address), tracking claims by IP address is insufficient. Instead, the frontend generates a unique, persistent Device ID (`masjidkita_device_id`) stored in `localStorage`. 

Every claim request sends this ID in the `x-device-id` header.
- **SQL Logic**: `SELECT id FROM coupons WHERE event_id = $1 AND claimed_by = $2`
- If a record is found, the backend returns a `409 Conflict` and re-displays the congregant's already-claimed coupon instead of issuing a new one.

## Concurrency and Race Conditions

When dozens of congregants scan the Master QR code simultaneously, the database must prevent race conditions (assigning the same unique coupon code to two different people). 

This is solved at the SQL level using `FOR UPDATE SKIP LOCKED` during the atomic claim transaction:

```sql
UPDATE coupons 
SET is_claimed = true, claimed_at = NOW(), claimed_by = $1
WHERE id = (
  SELECT id FROM coupons 
  WHERE event_id = $2 AND is_claimed = false 
  LIMIT 1 
  FOR UPDATE SKIP LOCKED
)
RETURNING id, code, claimed_at
```
This ensures high concurrency and absolute data integrity.
