# BRYCEN'S TO-DO LIST - ReviewPilot Launch

## 1. BUY DOMAIN (5 mins)
**Options:**
- reviewpilot.com (preferred)
- reviewpilot.ai (alternative)

**Where to buy:**
- Namecheap.com
- GoDaddy.com
- Cloudflare Domains

**Cost:** ~$10-15/year

---

## 2. POINT DOMAIN TO NETLIFY (5 mins)

Once you buy the domain, add these DNS records:

### If using Netlify DNS (recommended):
1. Go to Netlify dashboard → Domain settings
2. Click "Add custom domain"
3. Enter your domain (reviewpilot.com)
4. Netlify will give you nameservers
5. Update nameservers at your domain registrar

### Manual DNS (alternative):
**A Record:**
- Type: A
- Name: @
- Value: 75.2.60.5

**CNAME Record:**
- Type: CNAME
- Name: www
- Value: postpilotweb.netlify.app

---

## 3. CREATE STRIPE PRODUCTS (10 mins)

Go to: https://dashboard.stripe.com/products

### Product 1: Starter Plan
- Name: **ReviewPilot Starter**
- Description: 50 AI review responses per month
- Price: **$49/month**
- Billing: Recurring monthly
- **Copy the Price ID** (starts with price_...)

### Product 2: Pro Plan
- Name: **ReviewPilot Pro**
- Description: 150 AI review responses per month
- Price: **$99/month**
- Billing: Recurring monthly
- **Copy the Price ID** (starts with price_...)

**Send me both Price IDs** - I'll update the site.

---

## 4. GOOGLE CLOUD CONSOLE SETUP (15 mins)

Go to: https://console.cloud.google.com

### Step 1: Create Project
1. Click "Select a project" → "New Project"
2. Project name: **ReviewPilot**
3. Click "Create"

### Step 2: Enable Google Business Profile API
1. Go to "APIs & Services" → "Library"
2. Search for "Google Business Profile API"
3. Click "Enable"

### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Name: **ReviewPilot Web App**
5. Authorized redirect URIs:
   - `https://reviewpilot.com/.netlify/functions/google-oauth-callback`
   - `https://postpilotweb.netlify.app/.netlify/functions/google-oauth-callback`
6. Click "Create"
7. **Copy Client ID and Client Secret** - send to me

---

## 5. UPDATE NETLIFY ENVIRONMENT VARIABLES (5 mins)

Go to: Netlify dashboard → Site settings → Environment variables

**Add these new variables:**
- `GOOGLE_CLIENT_ID` = (from step 4)
- `GOOGLE_CLIENT_SECRET` = (from step 4)
- `STRIPE_PRICE_ID_STARTER` = (from step 3)
- `STRIPE_PRICE_ID_PRO` = (from step 3)
- `SITE_URL` = https://reviewpilot.com (or current domain)

---

## TOTAL TIME: ~40 minutes

Once you complete steps 1-5, **send me:**
1. Domain name you bought
2. Both Stripe Price IDs
3. Google OAuth Client ID and Secret

I'll integrate everything and the site will be 100% live.

---

**Current Status:**
- ✅ Site rebranded to ReviewPilot
- ✅ Landing page + demo working
- ✅ Signup/login functional
- ✅ Dashboard UI complete
- ⏳ Waiting on: Domain, Stripe products, Google OAuth
