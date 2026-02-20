// Verify Session Token
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const USERS_DIR = '/tmp/postpilot-users';
const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'default-key-change-in-production';

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function getUserById(userId) {
  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files) {
      const filepath = path.join(USERS_DIR, file);
      const data = await fs.readFile(filepath, 'utf8');
      const user = JSON.parse(data);
      if (user.id === userId) {
        return user;
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No authorization token provided' })
      };
    }

    const sessionData = authHeader.substring(7); // Remove 'Bearer '
    
    try {
      const decrypted = decrypt(sessionData);
      const session = JSON.parse(decrypted);
      
      // Check if session is expired
      if (session.expiresAt < Date.now()) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Session expired' })
        };
      }

      // Get user data
      const user = await getUserById(session.userId);
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'User not found' })
        };
      }

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
          }
        })
      };

    } catch (decryptErr) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid session token' })
      };
    }

  } catch (err) {
    console.error('Verify error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
