// User Signup Function
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Simple file-based user database (encrypted)
const USERS_DIR = '/tmp/postpilot-users';
const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'default-key-change-in-production';

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + ENCRYPTION_KEY).digest('hex');
}

async function ensureUsersDir() {
  try {
    await fs.mkdir(USERS_DIR, { recursive: true });
  } catch (err) {
    // Directory exists
  }
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

async function createUser(email, password, businessName) {
  const filename = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  const filepath = path.join(USERS_DIR, `${filename}.json`);
  
  const user = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    businessName,
    createdAt: new Date().toISOString(),
    subscription: {
      status: 'trial',
      plan: 'starter',
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      postsGenerated: 0,
      postsLimit: 30,
      billingPeriodStart: new Date().toISOString()
    }
  };
  
  await fs.writeFile(filepath, JSON.stringify(user, null, 2));
  return user;
}

function createSession(userId, email) {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const sessionData = {
    userId,
    email,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  };
  
  return {
    token: sessionToken,
    data: encrypt(JSON.stringify(sessionData))
  };
}

exports.handler = async (event) => {
  // CORS headers
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
    const { email, password, businessName } = JSON.parse(event.body);

    // Validation
    if (!email || !password || !businessName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email, password, and business name are required' })
      };
    }

    if (password.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Password must be at least 8 characters' })
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

    await ensureUsersDir();

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'An account with this email already exists' })
      };
    }

    // Create user
    const user = await createUser(email, password, businessName);
    
    // Create session
    const session = createSession(user.id, user.email);

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
    console.error('Signup error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
