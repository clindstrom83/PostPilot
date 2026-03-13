const { createUser } = require('./lib/users-simple');

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
    const { name, email, password } = JSON.parse(event.body);

    if (!name || !email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name, email, and password required' })
      };
    }

    if (password.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Password must be at least 8 characters' })
      };
    }

    const result = await createUser(name, email, password);

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
    console.error('Signup error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        details: error.stack,
        debug: 'Check Netlify function logs for more info'
      })
    };
  }
};
