// Simple admin authentication
// TODO: Change default password before production
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

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
    const { password } = JSON.parse(event.body);

    if (!password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Password required' })
      };
    }

    if (password === ADMIN_PASSWORD) {
      // Generate simple session token
      const token = require('crypto').randomBytes(32).toString('hex');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          token: token,
          message: 'Authenticated'
        })
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid password' })
      };
    }
  } catch (error) {
    console.error('Admin auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
