// Handle Google OAuth callback and store tokens
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Simple token storage (file-based for MVP)
const TOKENS_DIR = '/tmp/google-tokens';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function encryptToken(token) {
  const key = process.env.DB_ENCRYPTION_KEY;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(JSON.stringify(token), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function saveTokens(userId, tokens) {
  ensureDir(TOKENS_DIR);
  const encrypted = encryptToken(tokens);
  fs.writeFileSync(path.join(TOKENS_DIR, `${userId}.json`), encrypted);
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'text/html'
  };

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: 'Method not allowed'
    };
  }

  try {
    const { code, state, error } = event.queryStringParameters || {};

    // Handle OAuth errors
    if (error) {
      return {
        statusCode: 302,
        headers: {
          Location: `${process.env.SITE_URL}/dashboard.html?google_error=${error}`
        },
        body: ''
      };
    }

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: '<h1>Error: No authorization code received</h1>'
      };
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.SITE_URL}/.netlify/functions/google-oauth-callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      console.error('Token exchange error:', tokens);
      return {
        statusCode: 302,
        headers: {
          Location: `${process.env.SITE_URL}/dashboard.html?google_error=${tokens.error}`
        },
        body: ''
      };
    }

    // Save tokens for user
    const userId = state || 'default';
    saveTokens(userId, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000),
      scope: tokens.scope
    });

    // Redirect back to dashboard with success
    return {
      statusCode: 302,
      headers: {
        Location: `${process.env.SITE_URL}/dashboard.html?google_connected=true`
      },
      body: ''
    };

  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      statusCode: 500,
      headers,
      body: `<h1>Error</h1><p>${error.message}</p>`
    };
  }
};
