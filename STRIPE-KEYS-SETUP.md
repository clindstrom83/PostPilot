# Stripe Setup - ReviewPilot Website Builder

## Step 1: Get Your Stripe Keys

1. Go to https://dashboard.stripe.com
2. Click **Developers** in the left sidebar
3. Click **API keys**
4. Copy your **Publishable key** (starts with `pk_live_` or `pk_test_`)
5. Click **Reveal** on Secret key and copy it (starts with `sk_live_` or `sk_test_`)

## Step 2: Add Keys to Netlify

1. Go to your Netlify dashboard
2. Select the **ReviewPilot** site
3. Click **Site settings** → **Environment variables**
4. Click **Add a variable**

Add these 3 variables:

```
STRIPE_PUBLISHABLE_KEY = pk_live_YOUR_KEY_HERE
STRIPE_SECRET_KEY = sk_live_YOUR_KEY_HERE
SITE_URL = https://reviewpilot.business
```

5. Click **Save**

## Step 3: Update signup.html with Your Publishable Key

1. Open `signup.html`
2. Find this line (around line 285):
   ```javascript
   const stripe = Stripe('pk_live_51QhYpFBzK9NzrL4U...');
   ```
3. Replace with YOUR publishable key:
   ```javascript
   const stripe = Stripe('pk_live_YOUR_KEY_HERE');
   ```
4. Commit and push to GitHub

## Step 4: Redeploy

After adding environment variables to Netlify, the site will auto-redeploy (takes ~2 minutes).

OR manually trigger:
- Netlify Dashboard → **Deploys** → **Trigger deploy** → **Deploy site**

## Step 5: Test

1. Go to reviewpilot.business
2. Click "Get Started"
3. Choose a plan
4. Enter test info
5. Use test card: `4242 4242 4242 4242` (any future expiry, any CVC)
6. Should redirect to intake-form.html after payment

## How It Works

**Customer Journey:**
1. reviewpilot.business → sees pricing
2. Clicks "Get Started" → goes to signup.html
3. Chooses plan (Starter/Pro/Enterprise)
4. Enters name & email
5. Clicks "Proceed to Checkout" → redirects to Stripe
6. Completes payment on Stripe's secure page
7. Stripe charges:
   - One-time setup fee (Starter: $297, Pro: $497, Enterprise: $997)
   - First month subscription (Starter: $39, Pro: $49, Enterprise: $99)
8. Redirects back to intake-form.html
9. Customer fills out website requirements
10. You receive email with all their info
11. You build their site
12. Stripe automatically bills them monthly going forward

**What Gets Charged:**
- **Today:** Setup fee + First month = Total due today
- **Next month onward:** Just the monthly fee (recurring automatically)
- **Customer can cancel anytime** (stops future billing)

## Need Help?

Email: support@reviewpilot.business
Stripe Docs: https://stripe.com/docs/payments/checkout
