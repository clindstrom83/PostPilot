// User Login Function
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const USERS_DIR = '/tmp/postpilot-users';
const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'default-key-change-in-production';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + ENCRYPTION_KEY).digest('hex');
}

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

async function getUserByEmail(email) {
  const filename = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  const filepath = path.join(USERS_DIR, `${filename}.json`);
  try {
    const data = await fs.readFile(filepath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
}

function createSession(userId, email, rememberMe = false) {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiryDays = rememberMe ? 30 : 1;
  const sessionData = {
    userId,
    email,
    createdAt: Date.now(),
    expiresAt: Date.now() + expiryDays * 24 * 60 * 60 * 1000
  };
  
  return {
    token: sessionToken,
    data: encrypt(JSON.stringify(sessionData))
  };
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
    const { email, password, rememberMe } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and password are required' })
      };
    }

    const user = await getUserByEmail(email);
    
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      };
    }

    const passwordHash = hashPassword(password);
    if (passwordHash !== user.passwordHash) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      };
    }

    const session = createSession(user.id, user.email, rememberMe);

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
        session: session
      })
    };

  } catch (err) {
    console.error('Login error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
