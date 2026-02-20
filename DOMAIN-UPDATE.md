# DOMAIN UPDATE INSTRUCTIONS

## Domain Purchased: reviewpilot.business

### Netlify Environment Variables to Update

Go to: Netlify Dashboard → Site Settings → Environment Variables

**Update/Add this variable:**

```
SITE_URL=https://reviewpilot.business
```

This updates:
- Stripe checkout success/cancel URLs
- Google OAuth redirect URLs
- Email links (when implemented)

### Current Status
- ✅ Domain purchased through Netlify
- ✅ DNS propagating automatically (5-60 mins)
- ⏳ SSL certificate will auto-provision once DNS propagates
- ⏳ Need to update SITE_URL env var
- ⏳ Need Google Cloud Console OAuth setup

### Next Steps
1. Wait for DNS propagation (check https://reviewpilot.business in browser)
2. Update SITE_URL in Netlify env vars
3. Complete Google Cloud Console OAuth
4. Test full flow
5. Launch ads
