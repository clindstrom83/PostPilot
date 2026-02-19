# PostPilot API Documentation

## Base URL
```
Production: https://postpilot.ai/.netlify/functions/
Development: http://localhost:8888/.netlify/functions/
```

---

## Authentication

All authenticated endpoints require an `Authorization` header:
```
Authorization: Bearer {session_token}
```

Session tokens are returned from login/signup and stored in `localStorage`.

---

## Endpoints

### 1. User Signup
**POST** `/.netlify/functions/auth-signup`

Create a new user account and start free trial.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "businessName": "Gym"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "businessName": "Gym",
    "subscription": {
      "status": "trial",
      "plan": "starter",
      "trialEndsAt": "2026-02-26T12:00:00Z",
      "postsGenerated": 0,
      "postsLimit": 30
    }
  },
  "session": {
    "token": "hex-string",
    "data": "encrypted-session-data"
  }
}
```

**Errors:**
- `400` - Validation error (missing fields, weak password, invalid email)
- `400` - Email already exists
- `500` - Server error

---

### 2. User Login
**POST** `/.netlify/functions/auth-login`

Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "rememberMe": true
}
```

**Response (200):**
```json
{
  "success": true,
  "user": { ... },
  "session": {
    "token": "hex-string",
    "data": "encrypted-session-data"
  }
}
```

**Errors:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `500` - Server error

---

### 3. Verify Session
**GET** `/.netlify/functions/auth-verify`

Verify session token and get current user data.

**Headers:**
```
Authorization: Bearer {session_data}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "businessName": "Gym",
    "subscription": { ... }
  }
}
```

**Errors:**
- `401` - No token provided
- `401` - Invalid or expired token
- `500` - Server error

---

### 4. Password Reset Request
**POST** `/.netlify/functions/password-reset-request`

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

*Note: Always returns success to prevent email enumeration*

---

### 5. Password Reset Confirm
**POST** `/.netlify/functions/password-reset-confirm`

Complete password reset with token.

**Request Body:**
```json
{
  "token": "hex-token-from-email",
  "newPassword": "newsecurepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password successfully reset"
}
```

**Errors:**
- `400` - Invalid or expired token
- `400` - Password too short
- `500` - Server error

---

### 6. Generate Posts
**POST** `/.netlify/functions/generate-posts`

Generate AI-powered social media posts.

**Headers:**
```
Authorization: Bearer {session_data}
Content-Type: application/json
```

**Request Body:**
```json
{
  "businessType": "gym",
  "tone": "motivational",
  "count": 30
}
```

**Response (200):**
```json
{
  "success": true,
  "posts": [
    "Generated post content 1...",
    "Generated post content 2...",
    ...
  ],
  "usage": {
    "postsGenerated": 30,
    "postsRemaining": 0,
    "resetDate": "2026-03-01T00:00:00Z"
  }
}
```

**Errors:**
- `401` - Not authenticated
- `402` - Usage limit exceeded (need to upgrade)
- `500` - OpenAI API error

---

### 7. Save Post
**POST** `/.netlify/functions/save-post`

Save a generated post to user's library.

**Headers:**
```
Authorization: Bearer {session_data}
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Post content here",
  "platform": "instagram",
  "tone": "professional"
}
```

**Response (200):**
```json
{
  "success": true,
  "post": {
    "id": "uuid",
    "content": "Post content here",
    "platform": "instagram",
    "tone": "professional",
    "createdAt": "2026-02-19T12:00:00Z"
  }
}
```

---

### 8. Get Saved Posts
**GET** `/.netlify/functions/save-post`

Retrieve all saved posts for authenticated user.

**Headers:**
```
Authorization: Bearer {session_data}
```

**Response (200):**
```json
{
  "success": true,
  "posts": [
    {
      "id": "uuid",
      "content": "Post content",
      "platform": "instagram",
      "tone": "professional",
      "createdAt": "2026-02-19T12:00:00Z"
    },
    ...
  ]
}
```

---

### 9. Create Checkout Session
**POST** `/.netlify/functions/create-checkout`

Create Stripe checkout session for subscription.

**Headers:**
```
Authorization: Bearer {session_data}
Content-Type: application/json
```

**Request Body:**
```json
{
  "priceId": "price_starter_monthly",
  "successUrl": "https://postpilot.ai/dashboard.html?success=true",
  "cancelUrl": "https://postpilot.ai/billing.html?canceled=true"
}
```

**Response (200):**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

---

### 10. Stripe Webhook
**POST** `/.netlify/functions/stripe-webhook`

Handle Stripe webhook events (internal use only).

**Headers:**
```
Stripe-Signature: t=...,v1=...
```

**Events Handled:**
- `customer.subscription.created` - Activate subscription
- `customer.subscription.updated` - Update subscription status
- `customer.subscription.deleted` - Cancel subscription
- `invoice.payment_succeeded` - Reset usage limits
- `invoice.payment_failed` - Mark subscription as past_due

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Human-readable error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/expired session)
- `402` - Payment Required (usage limit exceeded)
- `403` - Forbidden
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## Rate Limiting

*To be implemented*

Recommended limits:
- Auth endpoints: 5 requests/minute
- Generate posts: 10 requests/hour
- Other endpoints: 60 requests/minute

---

## CORS

All endpoints allow cross-origin requests:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Data Encryption

- Passwords: SHA-256 hashing
- Session tokens: AES-256-CBC encryption
- Database: File-based encrypted JSON
- Encryption key: `DB_ENCRYPTION_KEY` environment variable

---

## Testing

**Test User Creation:**
```bash
curl -X POST https://postpilot.ai/.netlify/functions/auth-signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "businessName": "Test Business"
  }'
```

**Test Post Generation:**
```bash
curl -X POST https://postpilot.ai/.netlify/functions/generate-posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "businessType": "gym",
    "tone": "motivational",
    "count": 5
  }'
```

---

## Postman Collection

*Coming soon* - Import ready-to-use collection for testing all endpoints.

---

**Need help?** Check function logs in Netlify dashboard or contact support.
