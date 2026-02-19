# Stripe Webhook Setup Instructions

## Your Webhook Endpoint URL:
```
https://postpilotweb.netlify.app/.netlify/functions/stripe-webhook
```

## Steps to Configure in Stripe Dashboard:

1. **Go to Stripe Dashboard:**
   https://dashboard.stripe.com/webhooks

2. **Click "Add endpoint"**

3. **Enter Endpoint URL:**
   ```
   https://postpilotweb.netlify.app/.netlify/functions/stripe-webhook
   ```

4. **Select these events:**
   - ✅ customer.subscription.created
   - ✅ customer.subscription.updated
   - ✅ customer.subscription.deleted
   - ✅ invoice.payment_succeeded
   - ✅ invoice.payment_failed

5. **Click "Add endpoint"**

6. **Copy the Signing Secret:**
   - After creating the endpoint, you'll see a "Signing secret" (starts with `whsec_`)
   - Click "Reveal" and copy it

7. **Add to Netlify:**
   - Go to: https://app.netlify.com/sites/postpilotweb/settings/deploys#environment
   - Add new variable:
     ```
     STRIPE_WEBHOOK_SECRET = whsec_[paste-your-secret-here]
     ```

8. **Redeploy** your Netlify site after adding the variable

---

**Note:** You're using LIVE keys (`pk_live_` / `sk_live_`), so this will process real payments. Make sure you're ready for that, or switch to test keys first (`pk_test_` / `sk_test_`).
