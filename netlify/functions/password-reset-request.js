// Password Reset Request
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const USERS_DIR = '/tmp/postpilot-users';
const RESET_TOKENS_DIR = '/tmp/postpilot-reset-tokens';

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

async function createResetToken(userId, email) {
  await fs.mkdir(RESET_TOKENS_DIR, { recursive: true });
  
  const token = crypto.randomBytes(32).toString('hex');
  const tokenData = {
    userId,
    email,
    token,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
  };
  
  const filepath = path.join(RESET_TOKENS_DIR, `${token}.json`);
  await fs.writeFile(filepath, JSON.stringify(tokenData));
  
  return token;
}

// Mock email sending (replace with real email service later)
function sendResetEmail(email, token) {
  const resetLink = `https://postpilot.ai/reset-password.html?token=${token}`;
  console.log(`
    ==============================================
    PASSWORD RESET EMAIL
    ==============================================
    To: ${email}
    Subject: Reset Your PostPilot Password
    
    Click the link below to reset your password:
    ${resetLink}
    
    This link expires in 1 hour.
    
    If you didn't request this, ignore this email.
    ==============================================
  `);
  
  // TODO: Replace with actual email service (SendGrid, AWS SES, etc.)
  // For now, just log it
  return Promise.resolve();
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
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    const user = await getUserByEmail(email);
    
    // Always return success (don't reveal if email exists)
    if (user) {
      const token = await createResetToken(user.id, user.email);
      await sendResetEmail(user.email, token);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      })
    };

  } catch (err) {
    console.error('Password reset request error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
