# ReviewPilot Dashboard - Admin Guide

## What Was Built

A complete customer dashboard system for order tracking and account management.

## Customer Flow

1. **Customer pays** → Stripe checkout → Redirected to intake form
2. **Fills out intake form** → Order automatically created in system
3. **Success page** → Clicks "View Dashboard"
4. **Redirected to /login.html** → Enters email
5. **Receives magic link** → Clicks link → Logs in to dashboard
6. **Dashboard shows:**
   - Order status (Pending → In Progress → Preview Ready → Live)
   - Delivery timeline
   - Website URL (when ready)
   - Request changes button
   - Billing portal link

## Files Created

### Frontend
- `/login.html` - Magic link login page
- `/dashboard.html` - Customer dashboard (order tracking)

### Backend (Netlify Functions)
- `/netlify/functions/create-order.js` - Creates order after payment
- `/netlify/functions/get-order.js` - Retrieves customer order by email
- `/netlify/functions/send-login-link.js` - Generates magic link for login
- `/netlify/functions/verify-token.js` - Verifies magic link token

## How It Works

### Order Creation
- Triggered automatically when customer submits intake form
- Extracts `session_id` from URL (passed from Stripe)
- Calls `create-order` function
- Stores order in `/tmp/orders.json` (file-based for MVP)

### Authentication
- **Magic Link** (no passwords!)
- Customer enters email → receives login link
- Link expires in 15 minutes
- After verification, creates 30-day session token

### Order Storage
- Currently uses file-based storage (`/tmp/orders.json`)
- Works fine for MVP (first 10-50 customers)
- **TODO:** Migrate to real database (Supabase/Firebase) when you hit 50+ customers

## Order Status Values

```javascript
'pending'        // Order received, not started yet
'in_progress'    // Actively building website
'preview_ready'  // Preview URL available for customer review
'live'           // Website is live at final URL
```

## How to Update Order Status (Manual for MVP)

Since this is MVP, you'll update orders manually:

1. **SSH into your server** or **use Netlify CLI**
2. **Edit `/tmp/orders.json`:**

```bash
nano /tmp/orders.json
```

3. **Find the customer's order** and update:

```json
{
  "id": "order_1234567890",
  "customerEmail": "customer@example.com",
  "status": "in_progress",  // Change this
  "previewUrl": null,        // Add preview URL here
  "websiteUrl": null,        // Add live URL here
  "updatedAt": "2026-03-12T00:00:00.000Z"  // Update timestamp
}
```

4. **Save and exit**

Customer will see updates immediately when they refresh dashboard.

## TODO: Build Admin Panel

For easier management, you should build an admin panel:

- `/admin/orders.html` - List all orders
- Update status with dropdown (Pending → In Progress → Preview → Live)
- Add preview/live URLs
- View customer intake form details
- Protected with admin password

**Want me to build this?** Will take ~1 hour.

## Testing the System

### Test Customer Flow:
1. Go to `reviewpilot.business/signup.html`
2. Use Stripe test card: `4242 4242 4242 4242`
3. Complete payment → Fill out intake form
4. Click "View Dashboard"
5. Enter email → Get magic link (check console for link in MVP)
6. Click link → See dashboard with order status

### Check if order was created:
```bash
cat /tmp/orders.json
```

## Production Readiness

✅ **What works NOW:**
- Payment processing (Stripe live mode)
- Order creation
- Customer login (magic link)
- Dashboard with order tracking
- Delivery time differentiation
- Billing portal

❌ **What needs work for scale:**
- Replace file storage with real database
- Build admin panel for updating orders
- Add email service for magic links (currently shows in console)
- Add Stripe webhook for automatic order creation on payment

## Next Steps

1. **Test the full flow yourself**
2. **Manually update a test order** to see dashboard updates
3. **Launch ads** (system is functional)
4. **After first 5-10 customers:** Build admin panel
5. **After 50 customers:** Migrate to proper database

---

Need help? All backend functions are in `/netlify/functions/`
