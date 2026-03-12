const fs = require('fs').promises;

const TOKENS_FILE = '/tmp/login-tokens.json';

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
    const { token } = JSON.parse(event.body);

    if (!token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Token required' })
      };
    }

    const tokens = await loadTokens();
    const tokenData = tokens[token];

    if (!tokenData) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    // Check if expired
    if (tokenData.expires < Date.now()) {
      delete tokens[token];
      await saveTokens(tokens);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token expired' })
      };
    }

    // Token is valid - delete it (one-time use)
    const email = tokenData.email;
    delete tokens[token];
    await saveTokens(tokens);

    // Create session token (lasts longer)
    const sessionToken = require('crypto').randomBytes(32).toString('hex');
    const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

    tokens[sessionToken] = {
      email: email,
      expires: Date.now() + SESSION_EXPIRY,
      type: 'session',
      createdAt: new Date().toISOString()
    };

    await saveTokens(tokens);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        email: email,
        sessionToken: sessionToken
      })
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
