// MVP: Client-side auth - login just validates format
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
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and password are required' })
      };
    }

    // MVP: Return session in format the frontend expects
    const crypto = require('crypto');
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Mock user data - frontend will use its localStorage
    const user = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      businessName: 'Your Business',
      subscription: {
        status: 'trial',
        plan: 'starter',
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        postsGenerated: 0,
        postsLimit: 50
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        session: { token: sessionToken },
        user: user
      })
    };

  } catch (err) {
    console.error('Login error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error: ' + err.message })
    };
  }
};
