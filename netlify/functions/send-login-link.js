const { createToken } = require('./lib/storage');

const TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes

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

    // Create secure token
    const token = await createToken(email, TOKEN_EXPIRY);

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
