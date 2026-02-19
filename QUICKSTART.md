# PostPilot - Quick Start Guide

## Get It Running in 5 Minutes

### 1. Get Your API Keys

**OpenAI (Required for AI post generation)**
1. Go to https://platform.openai.com
2. Create account / Sign in
3. Go to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

**Stripe (Required for payments)**
1. Go to https://dashboard.stripe.com
2. Create account / Sign in
3. Toggle to "Test mode" (for now)
4. Go to Developers → API keys
5. Copy:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)

### 2. Deploy to Netlify

**Option A: Drag & Drop (Easiest)**
1. Zip the entire `postpilot` folder
2. Go to https://app.netlify.com
3. Drag zip file onto Netlify
4. Done!

**Option B: Via GitHub (Recommended)**
```bash
# In the postpilot directory
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/postpilot.git
git push -u origin main

# On Netlify:
# - Click "New site from Git"
# - Connect to GitHub
# - Select your repo
# - Deploy!
```

### 3. Add Environment Variables

In Netlify dashboard → Site settings → Environment variables:

```
DB_ENCRYPTION_KEY = GenerateA32CharRandomStringHere123
OPENAI_API_KEY = sk-your-key-from-step-1
STRIPE_SECRET_KEY = sk_test_your-key-from-step-1
STRIPE_PUBLISHABLE_KEY = pk_test_your-key-from-step-1
```

Click "Save" → Trigger a new deploy

### 4. Set Up Stripe Webhooks

1. In Stripe dashboard → Developers → Webhooks
2. Add endpoint: `https://your-site-name.netlify.app/.netlify/functions/stripe-webhook`
3. Select these events:
   - customer.subscription.created
   - customer.subscription.updated  
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
4. Copy the "Signing secret" (starts with `whsec_`)
5. Add to Netlify env vars as `STRIPE_WEBHOOK_SECRET`

### 5. Test It!

1. Go to your Netlify URL
2. Click "Start Free Trial"
3. Sign up with test email
4. Generate posts
5. Try checkout (use test card: 4242 4242 4242 4242)

**That's it!** Your SaaS is live. 🎉

---

## Going to Production

### Switch to Live Stripe Keys

1. In Stripe, toggle to "Live mode"
2. Get new API keys
3. Update Netlify env vars:
   - Replace `pk_test_` with `pk_live_`
   - Replace `sk_test_` with `sk_live_`
4. Update webhook to use live mode endpoint
5. Redeploy

### Add Custom Domain

1. Register domain (postpilot.ai)
2. In Netlify → Domain settings → Add custom domain
3. Follow DNS setup instructions
4. Wait for SSL certificate (automatic)

### Optional: Email Service

For password reset emails, add one of:

**SendGrid (Easiest)**
```
SENDGRID_API_KEY = your-api-key
```

**AWS SES / Mailgun / Postmark**
Update `password-reset-request.js` function with your provider's SDK

---

## Troubleshooting

**"Session expired" errors**
- Check that `DB_ENCRYPTION_KEY` is set in env vars
- Make sure it's exactly the same each time (don't change it)

**"Failed to generate posts"**
- Verify OpenAI key is correct
- Check you have API credits
- View function logs in Netlify

**Checkout not working**
- Use Stripe test mode first
- Test card: 4242 4242 4242 4242
- Any future date, any CVC

**Need help?**
Check the logs: Netlify dashboard → Functions → View logs

---

## What's Next?

1. **Customize branding** - Update colors, logo in HTML/CSS files
2. **Add analytics** - Google Analytics, Mixpanel, etc.
3. **Launch ads** - Meta, Google, Reddit ($10-50/day)
4. **Email sequences** - Welcome, onboarding, retention
5. **Add features** - Auto-scheduling, image generation, etc.

---

**Let's go make money.** 💰
