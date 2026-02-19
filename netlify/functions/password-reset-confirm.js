// Password Reset Confirmation
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const USERS_DIR = '/tmp/postpilot-users';
const RESET_TOKENS_DIR = '/tmp/postpilot-reset-tokens';
const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'default-key-change-in-production';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + ENCRYPTION_KEY).digest('hex');
}

async function getResetToken(token) {
  const filepath = path.join(RESET_TOKENS_DIR, `${token}.json`);
  try {
    const data = await fs.readFile(filepath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
}

async function deleteResetToken(token) {
  const filepath = path.join(RESET_TOKENS_DIR, `${token}.json`);
  try {
    await fs.unlink(filepath);
  } catch (err) {
    // Token doesn't exist
  }
}

async function updateUserPassword(email, newPasswordHash) {
  const filename = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  const filepath = path.join(USERS_DIR, `${filename}.json`);
  
  const data = await fs.readFile(filepath, 'utf8');
  const user = JSON.parse(data);
  user.passwordHash = newPasswordHash;
  
  await fs.writeFile(filepath, JSON.stringify(user, null, 2));
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
    const { token, newPassword } = JSON.parse(event.body);

    if (!token || !newPassword) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Token and new password are required' })
      };
    }

    if (newPassword.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Password must be at least 8 characters' })
      };
    }

    const resetToken = await getResetToken(token);
    
    if (!resetToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired reset token' })
      };
    }

    if (resetToken.expiresAt < Date.now()) {
      await deleteResetToken(token);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Reset token has expired' })
      };
    }

    const newPasswordHash = hashPassword(newPassword);
    await updateUserPassword(resetToken.email, newPasswordHash);
    await deleteResetToken(token);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Password successfully reset'
      })
    };

  } catch (err) {
    console.error('Password reset confirm error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
