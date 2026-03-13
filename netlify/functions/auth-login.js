const { loginUser } = require('./lib/users');

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
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and password required' })
      };
    }

    const result = await loginUser(email, password);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        sessionToken: result.sessionToken,
        user: result.user
      })
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
