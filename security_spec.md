# Security Specification for Firestore Rules

## 1. Data Invariants
- Admin operations strictly restricted to verified admin identities (including bootstrap admin `johncoleexpert@gmail.com`).
- Consultation services, seminars, and product catalog are publicly readable for active items, but writeable only by authorized administrators.
- Orders, Appointments, Seminar Registrations, and Live-streaming enquiries created by customers must adhere to strict schemas and initial statuses (`pending_payment`, `unpaid`, etc.).
- Payment records and financial transaction facts are write-protected; they are verified and managed strictly through authorized server endpoints or administrators.
- PII (customer email, phone numbers, addresses) can only be read by authorized administrators, or fetched securely server-side through phone-based OTP verification.

## 2. The "Dirty Dozen" Threat Payloads
1. **Admin Privilege Escalation**: Attacker attempts to write a document into `/admins/{attackerUid}` with role `"superadmin"`. (Blocked by `isAdmin()`)
2. **Product Price Tampering**: Attacker attempts to update `/products/{productId}` with `price: 1`. (Blocked by admin write restriction)
3. **Ghost Field Injection**: Attacker injects `isPaid: true` into an `/orders/{orderId}` payload. (Blocked by `isValidOrder` schema check)
4. **ID Poisoning Attack**: Attacker passes a 10KB string document ID into `/services/{id}`. (Blocked by `isValidId(id)`)
5. **Customer Booking State Shortcutting**: Attacker attempts to update appointment status from `pending_payment` to `confirmed` directly from browser. (Blocked: status updates restricted to admin)
6. **Negative or Null Quantity Attack**: Attacker creates an order with negative subtotal or corrupted types. (Blocked by schema constraints)
7. **Unrestricted PII Scraping**: Attacker queries `/orders` or `/appointments` to scrape customer phone numbers and addresses. (Blocked: public list queries forbidden)
8. **Spoofed Email Identity**: Attacker signs in with `johncoleexpert@gmail.com` without `email_verified: true`. (Blocked by `request.auth.token.email_verified == true`)
9. **Settings Hijacking**: Attacker attempts to change Paystack subaccount or platform fee in `/settings/global`. (Blocked by admin write check)
10. **Corrupted Seminar Capacity Write**: Attacker modifies `registeredCount` on `/seminars/{id}` to lock out other users. (Blocked by admin write check)
11. **Excessive String Payload Attack**: Attacker attempts to inject a 10MB description string into an enquiry. (Blocked by `.size() <= 1500` limit)
12. **Audit & Notification Tampering**: Attacker attempts to delete or modify `/notifications` or `/payments` audit logs. (Blocked by admin / server only policy)
