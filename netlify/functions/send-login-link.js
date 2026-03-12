const crypto = require('crypto');
const fs = require('fs').promises;

const TOKENS_FILE = '/tmp/login-tokens.json';
const TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes

async function loadTokens() {
  try {
    const data = await fs.readFile(TOKENS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function saveTokens(tokens) {
  await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2));
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
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email required' })
      };
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Load existing tokens
    const tokens = await loadTokens();
    
    // Clean expired tokens
    const now = Date.now();
    Object.keys(tokens).forEach(t => {
      if (tokens[t].expires < now) {
        delete tokens[t];
      }
    });
    
    // Save new token
    tokens[token] = {
      email: email.toLowerCase(),
      expires: now + TOKEN_EXPIRY,
      createdAt: new Date().toISOString()
    };
    
    await saveTokens(tokens);

    // Create login link
    const loginUrl = `${process.env.SITE_URL || 'https://reviewpilot.business'}/dashboard.html?token=${token}`;

    // TODO: Send email with login link
    // For MVP, we'll return the link (in production, send via email service)
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Login link generated',
        // Remove loginUrl in production after email service is set up
        loginUrl: loginUrl,
        expiresIn: '15 minutes'
      })
    };
  } catch (error) {
    console.error('Login link error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
