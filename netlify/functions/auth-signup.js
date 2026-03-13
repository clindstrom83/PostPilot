const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

const usersStore = () => getStore('users');
const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

// Simple password hashing (production should use bcrypt)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
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
    const { name, email, password } = JSON.parse(event.body);

    if (!name || !email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name, email, and password required' })
      };
    }

    if (password.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Password must be at least 8 characters' })
      };
    }

    const emailLower = email.toLowerCase();
    const store = usersStore();

    // Check if user already exists
    const existingUsers = await store.get('users', { type: 'json' }) || {};
    
    if (existingUsers[emailLower]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Account with this email already exists' })
      };
    }

    // Create new user
    const userId = `user_${Date.now()}`;
    const passwordHash = hashPassword(password);
    const sessionToken = crypto.randomBytes(32).toString('hex');

    existingUsers[emailLower] = {
      id: userId,
      name: name,
      email: emailLower,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
      sessions: {
        [sessionToken]: {
          expires: Date.now() + SESSION_EXPIRY,
          createdAt: new Date().toISOString()
        }
      }
    };

    await store.setJSON('users', existingUsers);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        sessionToken: sessionToken,
        user: {
          id: userId,
          name: name,
          email: emailLower
        }
      })
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
