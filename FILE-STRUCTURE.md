# PostPilot - File Structure

```
postpilot/
│
├── 📄 HTML Pages (11 pages)
│   ├── index.html              Landing page with demo
│   ├── signup.html             User registration
│   ├── login.html              User login
│   ├── forgot-password.html    Request password reset
│   ├── reset-password.html     Complete password reset
│   ├── dashboard.html          Main app (post generation)
│   ├── account.html            Account settings
│   ├── billing.html            Subscription management
│   ├── contact.html            Contact form + FAQ
│   ├── terms.html              Terms of Service
│   └── privacy.html            Privacy Policy
│
├── ⚙️ Backend Functions (9 functions)
│   └── netlify/functions/
│       ├── auth-signup.js              User registration
│       ├── auth-login.js               User authentication
│       ├── auth-verify.js              Session verification
│       ├── password-reset-request.js   Initiate reset
│       ├── password-reset-confirm.js   Complete reset
│       ├── save-post.js                Save/get posts
│       ├── generate-posts.js           AI post generation
│       ├── create-checkout.js          Stripe checkout
│       └── stripe-webhook.js           Subscription webhooks
│
├── 📚 Documentation (6 files)
│   ├── DEPLOYMENT-READY.md     Complete deployment guide
│   ├── QUICKSTART.md           5-minute setup
│   ├── API-DOCS.md             Full API documentation
│   ├── BUILD-STATUS.md         Project status
│   ├── STRIPE-SETUP.md         Stripe integration guide
│   └── README.md               Project overview
│
├── 🔧 Configuration (3 files)
│   ├── package.json            NPM config
│   ├── netlify.toml            Netlify config
│   └── .gitignore              Git ignore rules
│
└── 🎨 Assets
    └── dashboard-auth.js        Dashboard auth helper

```

## Database Structure (File-based)

```
/tmp/postpilot-users/
  └── {md5_hash_of_email}.json    User data (encrypted)

/tmp/postpilot-posts/{user_id}/
  └── {post_id}.json              Saved posts

/tmp/postpilot-reset-tokens/
  └── {token}.json                Password reset tokens (expire 1hr)
```

## Quick Stats

- **Total Files:** 29 files
- **HTML Pages:** 11 pages
- **Backend Functions:** 9 functions
- **Documentation:** 6 guides
- **Lines of Code:** ~5,000+ lines
- **Build Time:** Single session (Feb 19, 2026)

## What Each File Does

### Frontend (User-facing)
| File | Purpose | Status |
|------|---------|--------|
| `index.html` | Landing page, gets signups | ✅ Done |
| `signup.html` | User registration | ✅ Done |
| `login.html` | User login | ✅ Done |
| `dashboard.html` | Main app, generate posts | ✅ Done |
| `account.html` | Profile settings | ✅ Done |
| `billing.html` | Manage subscription | ✅ Done |
| `forgot-password.html` | Request password reset | ✅ Done |
| `reset-password.html` | Set new password | ✅ Done |
| `contact.html` | Contact form + FAQ | ✅ Done |
| `terms.html` | Legal terms | ✅ Done |
| `privacy.html` | Privacy policy | ✅ Done |

### Backend (Serverless functions)
| Function | Purpose | Status |
|----------|---------|--------|
| `auth-signup` | Create user account | ✅ Done |
| `auth-login` | Authenticate user | ✅ Done |
| `auth-verify` | Verify session token | ✅ Done |
| `password-reset-request` | Send reset email | ✅ Done |
| `password-reset-confirm` | Update password | ✅ Done |
| `save-post` | Save generated posts | ✅ Done |
| `generate-posts` | AI post generation | ⏳ Needs OpenAI key |
| `create-checkout` | Stripe checkout | ⏳ Needs Stripe keys |
| `stripe-webhook` | Handle subscriptions | ⏳ Needs Stripe webhook |

### Documentation
| File | Purpose | For Who |
|------|---------|---------|
| `DEPLOYMENT-READY.md` | Full deployment guide | You + devs |
| `QUICKSTART.md` | Get running in 5 mins | You |
| `API-DOCS.md` | Complete API reference | Devs |
| `BUILD-STATUS.md` | Project progress | You |
| `FILE-STRUCTURE.md` | This file! | You |

## Environment Variables Needed

```bash
DB_ENCRYPTION_KEY=your-32-char-key          # Required
OPENAI_API_KEY=sk-your-key                  # For AI posts
STRIPE_SECRET_KEY=sk_test_your-key          # For payments
STRIPE_PUBLISHABLE_KEY=pk_test_your-key     # For checkout
STRIPE_WEBHOOK_SECRET=whsec_your-secret     # For webhooks
```

## How to Deploy

1. **Get keys** (OpenAI, Stripe, domain)
2. **Push to Netlify** (drag & drop or GitHub)
3. **Add env vars** in Netlify dashboard
4. **Configure webhooks** in Stripe
5. **Test** full user journey
6. **Launch ads** and start getting customers

---

**Current Status:** Product is 100% code-complete. Just needs API keys to go live. 🚀
