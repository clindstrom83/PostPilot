# Netlify Environment Variables - COPY/PASTE READY

Go to: https://app.netlify.com/sites/postpilotweb/settings/deploys#environment

Add these 5 variables:

---

**Variable 1:**
```
Name: DB_ENCRYPTION_KEY
Value: d69a803abc006af2c4701060d65cfd27
```

---

**Variable 2:**
```
Name: OPENAI_API_KEY
Value: [YOUR_OPENAI_API_KEY - Already added to Netlify]
```

---

**Variable 3:**
```
Name: STRIPE_SECRET_KEY
Value: [YOUR_STRIPE_SECRET_KEY - Already added to Netlify]
```

---

**Variable 4:**
```
Name: STRIPE_PUBLISHABLE_KEY
Value: [YOUR_STRIPE_PUBLISHABLE_KEY - Already added to Netlify]
```

---

**Variable 5: (Add AFTER setting up webhook)**
```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_[GET THIS FROM STRIPE AFTER CREATING WEBHOOK]
```

To get the webhook secret, follow: `STRIPE-WEBHOOK-SETUP.md`

---

## After Adding All Variables:

1. Click "Save" in Netlify
2. Trigger a new deploy (Deploys → Trigger deploy → Deploy site)
3. Wait for deploy to finish (~2 mins)
4. Test the site at: https://postpilotweb.netlify.app

---

**Current Status:**
- ✅ Keys collected
- ⏳ Add to Netlify
- ⏳ Set up Stripe webhook
- ⏳ Redeploy
- ⏳ Test signup/login/generate posts
