# Stripe Integration Setup

## ✅ What's Been Built

1. **Netlify Functions:**
   - `create-checkout.js` - Creates Stripe checkout sessions
   - `stripe-webhook.js` - Handles Stripe webhook events

2. **Pages:**
   - `billing.html` - Subscription management page
   - Updated signup/login flow for trial handling

3. **Environment Variables:**
   - Stored in `.env` (not committed to git)
   - Need to be added to Netlify

## 🚧 Next Steps to Complete Integration

### 1. Add Environment Variables to Netlify

Go to: Netlify Dashboard → Site Settings → Environment Variables

Add these (replace with your actual keys from .env file):
```
STRIPE_PUBLISHABLE_KEY=pk_live_... (your publishable key)
STRIPE_SECRET_KEY=sk_live_... (your secret key)
OPENAI_API_KEY=sk-proj-... (your OpenAI key)
SITE_URL=https://postpilotweb.netlify.app
STRIPE_WEBHOOK_SECRET=(to be generated - see step 2)
```

### 2. Create Stripe Products & Prices

**In Stripe Dashboard:**

1. Go to: Products → "Add product"

2. **Create Starter Plan:**
   - Name: "PostPilot Starter"
   - Description: "30 AI-generated posts per month"
   - Price: $29/month (recurring)
   - Copy the **Price ID** (starts with `price_...`)

3. **Create Pro Plan (for later):**
   - Name: "PostPilot Pro"
   - Description: "Unlimited AI-generated posts"
   - Price: $79/month (recurring)
   - Copy the **Price ID**

4. Update the price IDs in the signup code:
   ```javascript
   const STRIPE_PRICE_STARTER = 'price_XXXXX'; // Replace with actual ID
   const STRIPE_PRICE_PRO = 'price_XXXXX';
   ```

### 3. Set Up Stripe Webhook

**In Stripe Dashboard:**

1. Go to: Developers → Webhooks → "Add endpoint"

2. **Endpoint URL:** 
   ```
   https://postpilotweb.netlify.app/.netlify/functions/stripe-webhook
   ```

3. **Select events to listen to:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`

4. Copy the **Webhook signing secret** (starts with `whsec_...`)

5. Add it to Netlify environment variables as `STRIPE_WEBHOOK_SECRET`

### 4. Redeploy Site

After adding env vars to Netlify:
- Netlify will auto-redeploy
- OR manually trigger: Site settings → Deploys → "Trigger deploy"

### 5. Test the Flow

1. Go to postpilotweb.netlify.app
2. Click "Start Free Trial"
3. Fill out signup form
4. Complete Stripe checkout (use test card: 4242 4242 4242 4242)
5. Verify you land on dashboard
6. Check Stripe dashboard for subscription

## 🔐 Security Notes

- `.env` file is in `.gitignore` (never committed)
- All secrets stored in Netlify environment variables
- Webhook uses signature verification for security

## 📋 TODO (Future Enhancements)

- [ ] Customer Portal integration (change payment method, cancel)
- [ ] Upgrade/downgrade between plans
- [ ] Usage tracking (30 posts/month limit enforcement)
- [ ] Email notifications (trial ending, payment failed)
- [ ] Invoice history page

---

**Status:** Stripe backend ready. Need to add env vars to Netlify & create products.
