# 🚨 BRYCEN - DO THIS NOW (15 Minutes)

I've migrated ReviewPilot to Supabase. Your login will work forever once you complete these steps.

---

## Step 1: Sign Up for Supabase (3 minutes)

1. **Open:** https://supabase.com
2. **Click:** "Start your project" 
3. **Sign up** with GitHub or Email (I recommend: rustbuyer101@gmail.com)
4. **IMPORTANT:** Check your email and click the confirmation link
5. Once confirmed, you'll see the Supabase dashboard

---

## Step 2: Create Project (2 minutes)

1. **Click:** "New Project"
2. **Organization:** Create one called "ReviewPilot" (or use existing)
3. **Fill in:**
   - **Name:** `reviewpilot`
   - **Database Password:** Create a strong password (SAVE THIS SOMEWHERE SAFE)
   - **Region:** Select `East US (North Virginia)`
4. **Click:** "Create new project"
5. **Wait ~2 minutes** for the database to provision (green checkmark when ready)

---

## Step 3: Set Up Database Schema (2 minutes)

1. In Supabase dashboard, **click "SQL Editor"** (left sidebar, looks like `</>`)
2. **Click:** "+ New query" (top right)
3. **Open this file** on your computer: `/data/.openclaw/workspace/postpilot/supabase-schema.sql`
4. **Copy everything** in that file
5. **Paste** into the Supabase SQL editor
6. **Click "Run"** (bottom right corner)
7. Should see: "Success. No rows returned" ✅

---

## Step 4: Get Your API Keys (2 minutes)

1. In Supabase dashboard, go to **Settings** (gear icon, bottom left)
2. Click **API** in the Settings menu
3. You'll see two important things:

### A) Project URL
   - Copy the URL (looks like `https://abcdefghijk.supabase.co`)
   - Save it somewhere

### B) API Keys
   - **anon / public:** Copy this key (starts with `eyJ...`)
   - **service_role:** Click "Reveal", then copy this key (also starts with `eyJ...`)
   - Save both somewhere

---

## Step 5: Add to Netlify (5 minutes)

1. **Go to:** https://app.netlify.com
2. **Find** your ReviewPilot site
3. **Click:** Site settings → Environment variables (left sidebar)
4. **Add these 3 NEW variables:**

   Click "Add a variable" for each:

   **Variable 1:**
   - Key: `SUPABASE_URL`
   - Value: `https://abcdefghijk.supabase.co` (your URL from Step 4)

   **Variable 2:**
   - Key: `SUPABASE_ANON_KEY`
   - Value: `eyJ...` (your anon key from Step 4)

   **Variable 3:**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `eyJ...` (your service_role key from Step 4)

5. **Click "Save"** after adding all three

---

## Step 6: Trigger Deploy (1 minute)

1. In Netlify, go to **Deploys** tab (top)
2. **Click:** "Trigger deploy" → "Deploy site"
3. Wait ~2 minutes for the deploy to finish (green checkmark)

---

## Step 7: Test It! (2 minutes)

1. Go to: **https://reviewpilot.business/signup.html** (or your current URL)
2. Sign up with a NEW email (don't use old one from broken system)
3. Fill in business name, password, etc.
4. Click "Start Free Trial"
5. Should redirect to dashboard ✅
6. **Log out** and **log back in** → should work perfectly!

---

## ✅ What This Fixes

- **No more disappearing logins** - Supabase stores users permanently
- **Real database** - PostgreSQL, not temp files
- **Scalable** - Can handle 50,000+ users on free tier
- **Professional** - What real SaaS companies use (like PostHog, Cal.com)

---

## 🆘 If You Get Stuck

Just message me:
- "stuck on step X" → I'll walk you through it
- "keys not working" → I'll help debug
- "where's the SQL file?" → I'll show you the exact path

I've already pushed all the code. You just need to:
1. Create the Supabase account/project
2. Copy/paste the SQL schema
3. Add the 3 env vars to Netlify
4. Deploy

Takes 15 minutes total. Then login works FOREVER.

---

**Let's fucking go.** 🚀
