// Simple Auth Login
const crypto = require('crypto');
const { getStore } = require('@netlify/blobs');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'reviewpilot-salt-2026').digest('hex');
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and password are required' })
      };
    }

    const store = getStore('users');
    const userKey = `user-${email.toLowerCase()}`;
    const userData = await store.get(userKey);
    
    if (!userData) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      };
    }

    const user = JSON.parse(userData);
    const passwordHash = hashPassword(password);
    
    if (passwordHash !== user.passwordHash) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      };
    }

    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionData = {
      userId: user.id,
      email: user.email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    };
    
    await store.set(`session-${sessionToken}`, JSON.stringify(sessionData));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          businessName: user.businessName,
          subscription: user.subscription
        },
        session: sessionToken
      })
    };

  } catch (err) {
    console.error('Login error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error: ' + err.message })
      };
  }
};
