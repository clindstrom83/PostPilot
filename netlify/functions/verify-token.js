const { verifyToken, deleteToken, createToken } = require('./lib/storage');

const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

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

    const tokenData = await verifyToken(token);

    if (!tokenData) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired token' })
      };
    }

    // Token is valid - delete it (one-time use)
    const email = tokenData.email;
    await deleteToken(token);

    // Create session token (lasts longer)
    const sessionToken = await createToken(email, SESSION_EXPIRY);

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
