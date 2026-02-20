// Simple Auth Signup - Auto-generated passwords
const crypto = require('crypto');
const { getStore } = require('@netlify/blobs');

function generatePassword() {
  // Generate a memorable but secure password
  const adjectives = ['Quick', 'Smart', 'Bold', 'Bright', 'Swift', 'Calm', 'Happy', 'Lucky'];
  const nouns = ['Tiger', 'Eagle', 'River', 'Mountain', 'Ocean', 'Storm', 'Star', 'Moon'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9999);
  return `${adj}${noun}${num}`;
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'reviewpilot-salt-2026').digest('hex');
}

exports.handler = async (event, context) => {
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
    const { email, businessName } = JSON.parse(event.body);

    // Validation
    if (!email || !businessName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and business name are required' })
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    // Use Netlify Blobs for persistent storage
    const store = getStore('users');
    
    // Check if user exists
    const userKey = `user-${email.toLowerCase()}`;
    const existingUser = await store.get(userKey);
    
    if (existingUser) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'An account with this email already exists' })
      };
    }

    // Generate password
    const generatedPassword = generatePassword();
    const passwordHash = hashPassword(generatedPassword);

    // Create user
    const user = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      passwordHash,
      businessName,
      createdAt: new Date().toISOString(),
      subscription: {
        status: 'trial',
        plan: 'starter',
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        postsGenerated: 0,
        postsLimit: 50,
        billingPeriodStart: new Date().toISOString()
      }
    };

    // Save user
    await store.set(userKey, JSON.stringify(user));

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionData = {
      userId: user.id,
      email: user.email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
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
        session: sessionToken,
        password: generatedPassword // Send back the generated password
      })
    };

  } catch (err) {
    console.error('Signup error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error: ' + err.message })
    };
  }
};
