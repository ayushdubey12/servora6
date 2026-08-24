# Direct UPI Auto-Confirmation — Phone Relay Setup

The website confirms UPI payments automatically using a notification relay on
the phone that receives the payments. No payment gateway involved.

## How it works

```
Customer pays your BHIM UPI ID  →  BHIM app on your phone shows a notification
→  MacroDroid reads it  →  POSTs the amount to your server webhook
→  server matches amount/code to the pending order  →  website shows "Paid ✓"
```

## One-time server config

1. Render backend env vars:
   ```
   UPI_WEBHOOK_SECRET=<the secret from backend/.env>
   ```
2. Your VPA is already configured (`dcpayush@upi`). To change it later:
   ```bash
   curl -X PUT https://<backend>/api/restaurants/<restaurantId> \
     -H "Authorization: Bearer <owner-token>" \
     -H "Content-Type: application/json" \
     -d '{"upiVpa":"newvpa@upi","upiPayeeName":"Hotel Siraj"}'
   ```

## Phone setup (MacroDroid — free)

1. Install **MacroDroid** from Play Store.
2. Give it **Notification Access** and disable **battery optimization**
   for MacroDroid (Settings → Battery → Unrestricted). This is critical —
   Android kills background apps otherwise.
3. Create a new macro:
   - **Trigger:** *Notification* → select **BHIM** application.
   - **Action:** *HTTP POST*
     - URL: `https://<your-backend>.onrender.com/api/payments/upi-webhook`
     - Headers: `Content-Type: application/json` and `X-Webhook-Secret: <secret>`
     - Body (JSON):
       ```json
       {"amount": "{lv=amount}", "reference": "{lv=ref}", "app": "bhim", "raw": "{notification}"}
       ```
   - Before the HTTP action, add a **Text Manipulation / Set Variable** step to
     extract values from `{notification}` (BHIM formats vary by version):
     - Amount regex: `[₹Rs.\s]*([0-9]+(?:\.[0-9]{1,2})?)` → variable `amount`
     - Reference: use the notification timestamp as pseudo-ref, e.g. `{year}{month}{day}{hour}{minute}` → `ref`
4. Test: send yourself ₹1 from another UPI account and watch the backend logs
   for `[UPI Webhook]`.

## Matching rules (server side)

- Each "Pay via UPI" order gets a **unique paise amount** (e.g. ₹420.37) and a
  **short code** (e.g. `K7Q2M3`) that appears in the payment note.
- Webhooks match by short code first, then exact amount, within a 20-minute
  window. Duplicates are ignored via reference idempotency.
- Ambiguous or unmatched notifications are logged and fall back to manual staff
  confirmation — the system never guesses.

## Notes & limits

- The relay phone needs internet only at the moment of payment; location doesn't matter.
- If two restaurants share one phone/webhook, identical amounts across them are
  flagged for review rather than auto-matched. Use one relay per restaurant later.
- Customer may pay up to ₹1 over the bill total due to the paise fingerprint;
  underpayment is impossible. Adjust expectations accordingly.
