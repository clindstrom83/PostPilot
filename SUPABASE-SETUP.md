# Supabase Setup Guide for ReviewPilot

## Step 1: Create Supabase Account (5 minutes)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with your email
4. **Check your email and confirm** (important!)

## Step 2: Create New Project (2 minutes)

1. Click "New Project"
2. Choose organization (or create one)
3. Fill in:
   - **Name:** `reviewpilot`
   - **Database Password:** (generate strong password, SAVE THIS!)
   - **Region:** `East US (North Virginia)` (closest to you)
4. Click "Create new project"
5. Wait ~2 minutes for provisioning

## Step 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the contents of `supabase-schema.sql` from this repo
4. Paste into the SQL editor
5. Click "Run" (bottom right)
6. Should see "Success. No rows returned"

## Step 4: Get API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Find these values:

   **Project URL:**
   - Copy the URL (looks like `https://xxxxx.supabase.co`)
   
   **anon public:**
   - Copy this key (starts with `eyJ...`)
   
   **service_role (secret!):**
   - Click "Reveal" 
   - Copy this key (starts with `eyJ...`)

## Step 5: Add to Netlify Environment Variables

1. Go to Netlify dashboard: https://app.netlify.com
2. Select ReviewPilot site
3. Go to **Site settings** → **Environment variables**
4. Add these three new variables:

   ```
   SUPABASE_URL = https://xxxxx.supabase.co
   SUPABASE_ANON_KEY = eyJ... (your anon key)
   SUPABASE_SERVICE_ROLE_KEY = eyJ... (your service_role key)
   ```

5. Click "Save"

## Step 6: Deploy Updated Functions

Jarvis will handle this part - just need to:
1. Rename auth functions to use Supabase versions
2. Commit and push to GitHub
3. Netlify auto-deploys
4. Test signup/login

## What This Fixes

✅ **Persistent storage** - Users don't disappear anymore
✅ **Real database** - PostgreSQL, not /tmp files
✅ **Built-in auth** - JWT tokens, secure sessions
✅ **Scalable** - Handle 50K+ users for free
✅ **Professional** - What real SaaS companies use

## Need Help?

Tell Jarvis if you get stuck on any step. He'll walk you through it.
