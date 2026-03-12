# Admin Panel - Quick Start Guide

## Access

**URL:** `https://reviewpilot.business/admin.html`

**Default Password:** `admin123`

⚠️ **CHANGE THIS PASSWORD** before launching to production!

To change: Edit `admin.html` line 382:
```javascript
const ADMIN_PASSWORD = 'admin123'; // Change this!
```

---

## Features

### 📊 Dashboard Overview
- **Total Orders:** All orders in system
- **Pending:** New orders waiting to be started
- **In Progress:** Orders being built
- **Live:** Completed and launched sites

### 📦 Order Management

Each order card shows:
- Customer name & email
- Plan (Starter/Pro/Enterprise)
- Delivery time (72hr/48hr/24hr)
- Order date
- Current status

### ✏️ Update Orders

For each order you can:

1. **Change Status:**
   - ⏳ Pending → Just received, not started
   - 🔨 In Progress → Actively building
   - 👀 Preview Ready → Preview URL available
   - 🎉 Live → Website launched

2. **Add URLs:**
   - **Preview URL:** Staging site for customer review
   - **Live URL:** Final production website

3. **Save Changes:**
   - Click "💾 Save Changes" after making updates
   - Customer sees updates immediately in their dashboard

---

## Typical Workflow

### New Order Received:
1. Order automatically created as **Pending**
2. You receive intake form email with requirements

### Start Building:
1. Change status to **In Progress**
2. Click "Save Changes"
3. Customer sees "Building Your Website" in dashboard

### Preview Ready:
1. Upload site to staging/preview server
2. Add Preview URL (e.g., `https://preview-customersite.netlify.app`)
3. Change status to **Preview Ready**
4. Click "Save Changes"
5. Customer gets "Preview Ready" in dashboard with link

### Customer Approves (or requests changes):
1. Make final adjustments if needed
2. Point domain to final hosting

### Go Live:
1. Add Live URL (e.g., `https://customerwebsite.com`)
2. Change status to **Live**
3. Click "Save Changes"
4. Customer sees "🎉 Website Live!" with link

---

## Tips

### Fast Updates:
- Keep admin panel open in a tab
- Click "🔄 Refresh" to see new orders
- Save changes immediately after updating

### Status Best Practices:
- Move to "In Progress" as soon as you start
- Use "Preview Ready" even if changes are needed (customers like seeing progress)
- Only use "Live" when domain is pointed and site is 100% done

### URL Format:
- Must include `https://` or `http://`
- Preview: Use Netlify/Vercel subdomain
- Live: Customer's actual domain

---

## Customer Experience

When you update an order, customers see:

**Pending:**
- "⏳ Order Received"
- "We've received your order and will start building soon"

**In Progress:**
- "🔨 Building Your Website"
- Visual timeline shows progress
- Estimated delivery countdown

**Preview Ready:**
- "👀 Preview Ready"
- "View Preview" button appears
- Can request changes via dashboard

**Live:**
- "🎉 Live"
- Green success banner
- "Visit Your Website" button

---

## Security

### Current Setup:
- Simple password protection (MVP)
- Password stored in HTML (fine for MVP)
- No database credentials exposed

### For Production (After 20+ customers):
- [ ] Change default password
- [ ] Add IP whitelist (only your IP can access)
- [ ] Consider adding 2FA
- [ ] Move to server-side auth

---

## Troubleshooting

### "Failed to load orders"
- Orders stored in `/tmp/orders.json` on Netlify
- File may be cleared on redeploy
- **Solution:** Will migrate to real database when needed

### Orders not showing up
- Check if intake form was submitted
- Verify Stripe payment completed
- Check browser console for errors

### Can't save changes
- Check internet connection
- Try clicking "🔄 Refresh" first
- Check browser console for errors

---

## Next Steps

After first 10-20 customers, consider:
- Real database (Supabase/Firebase) instead of file storage
- Email notifications when order status changes
- Bulk actions (update multiple orders at once)
- Search/filter orders
- Customer notes/comments

---

## Access the Admin Panel

Go to: **https://reviewpilot.business/admin.html**

Password: `admin123` (change this!)

---

Need help? Check `DASHBOARD-ADMIN-GUIDE.md` for technical details.
