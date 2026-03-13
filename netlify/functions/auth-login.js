const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

const usersStore = () => getStore('users');
const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

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
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and password required' })
      };
    }

    const emailLower = email.toLowerCase();
    const store = usersStore();
    const users = await store.get('users', { type: 'json' }) || {};
    const user = users[emailLower];

    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      };
    }

    const passwordHash = hashPassword(password);
    
    if (user.passwordHash !== passwordHash) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      };
    }

    // Create new session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    if (!user.sessions) {
      user.sessions = {};
    }
    
    user.sessions[sessionToken] = {
      expires: Date.now() + SESSION_EXPIRY,
      createdAt: new Date().toISOString()
    };

    // Clean old sessions
    Object.keys(user.sessions).forEach(token => {
      if (user.sessions[token].expires < Date.now()) {
        delete user.sessions[token];
      }
    });

    // Save updated user
    users[emailLower] = user;
    await store.setJSON('users', users);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        sessionToken: sessionToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      })
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
