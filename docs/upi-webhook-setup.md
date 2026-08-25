# Direct UPI Auto-Confirmation — MacroDroid Setup Guide

The restaurant's phone listens for BHIM payment notifications and relays them
to the server, which auto-confirms the matching order. No gateway involved.

```
Customer pays dcpayush@upi → BHIM notification on your phone
→ MacroDroid POSTs the notification text to your backend
→ Server extracts amount + short code, matches the pending order
→ Customer's screen flips to "Paid ✓" automatically
```

---

## Part 1 — Render (one time)

1. Open https://dashboard.render.com → your **backend** service → **Environment**.
2. Add:
   ```
   UPI_WEBHOOK_SECRET = 5ce4e1a18638bbbc5f18d22acc6cfeeeaa51deb3cb3fdb70
   ```
3. Save. Note your **backend URL** from the service header
   (looks like `https://servora-backend-xxxx.onrender.com`).
4. Your VPA is already configured (`dcpayush@upi`). Change later via:
   ```bash
   curl -X PUT https://<backend-url>/api/restaurants/<restaurantId> \
     -H "Authorization: Bearer <owner-token>" -H "Content-Type: application/json" \
     -d '{"upiVpa":"newvpa@upi","upiPayeeName":"Hotel Siraj"}'
   ```

## Part 2 — Phone: prepare Android

On the phone that receives payments (yours is fine):

1. Install **BHIM** and log in with `dcpayush@upi`'s bank account.
2. Install **MacroDroid** (Play Store, free plan allows 5 macros).
3. Open MacroDroid → grant **Notification access** when prompted.
4. **Critical:** Android Settings → Apps → MacroDroid → Battery →
   **Unrestricted / Don't optimize**. Without this, Android kills the relay.
5. In MacroDroid: Settings → **Start at boot** = ON.

## Part 3 — Phone: create the macro

MacroDroid → **Add Macro** (+) → name it `UPI Relay`:

### Trigger
1. Tap **+** (Add Trigger) → **Notifications** → **Notification Received**.
2. Application → select **BHIM**.
3. (Optional, recommended) *Select Text Content* → contains → type `received`
   so it only fires on credit notifications, not on every BHIM ping.

### Action
1. Tap **+** (Add Action) → **Network** → **HTTP POST**? Choose
   **HTTP Request** (Method: `POST`).
2. URL:
   ```
   https://<backend-url>/api/payments/upi-webhook
   ```
3. Headers → add both:
   ```
   X-Webhook-Secret: 5ce4e1a18638bbbc5f18d22acc6cfeeeaa51deb3cb3fdb70
   Content-Type: text/plain
   ```
4. Custom body — just insert the magic text for the notification:
   ```
   {notification}
   ```
   (Use the `{}` / magic-text picker → Variables/Notification → Notification.)
   That's all — no parsing on the phone; the server extracts amount & code.
5. Success/failure output: leave defaults. Save macro → enable it (toggle).

## Part 4 — Test end to end

1. Place a real order via your QR menu → tap **Pay via UPI** → note the
   amount like `₹294.37` and code like `K7Q2M3`. Leave the page open.
2. From a second UPI account, send EXACTLY that amount to `dcpayush@upi`
   via BHIM.
3. Within ~3–10 seconds the payment page should flip to **Payment Successful!**
   Backend logs (Render → Logs) will show `[UPI Webhook] {...}` lines.
4. Also test the failure path: send a random amount — nothing should be marked
   paid (it lands in server logs for manual staff confirmation).

## Troubleshooting

| Symptom | Fix |
|---|---|
| Nothing in logs after paying | MacroDroid trigger didn't fire → check notification filter word ("received" vs BHIM wording like "credited"); loosen or remove the text filter |
| Log shows `[UPI Webhook] ... 401` | Secret mismatch — re-copy header value |
| `reason:"no_candidate"` | Amount didn't match any pending intent (customer paid wrong amount) — confirm manually from Staff dashboard |
| `reason:"duplicate"` | Normal — same notification relayed twice |
| Auto-confirm stops working after days | Battery optimization re-enabled by an update — re-set to Unrestricted |
| Works only while charging | Same battery issue; also disable "Adaptive Battery" |

## Notes & limits

- Phone needs internet at the moment of payment; physical location irrelevant.
- Customer pays up to ₹1 over bill total (paise fingerprint); never under.
- Ambiguous notifications are logged + escalate to staff — never auto-guessed.
- One relay phone per restaurant is recommended once you onboard others.
