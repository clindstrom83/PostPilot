// MVP: Client-side only auth - just generate a password and let them use the app
const crypto = require('crypto');

function generatePassword() {
  const adjectives = ['Quick', 'Smart', 'Bold', 'Bright', 'Swift', 'Calm', 'Happy', 'Lucky'];
  const nouns = ['Tiger', 'Eagle', 'River', 'Mountain', 'Ocean', 'Storm', 'Star', 'Moon'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9999);
  return `${adj}${noun}${num}`;
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
    const { email, businessName } = JSON.parse(event.body);

    // Validation
    if (!email || !businessName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and business name are required' })
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    // For MVP: Just generate a password and return success
    // No database - everything stored client-side
    const generatedPassword = generatePassword();
    const userId = crypto.randomUUID();
    const sessionToken = crypto.randomBytes(32).toString('hex');

    const user = {
      id: userId,
      email: email.toLowerCase(),
      businessName,
      createdAt: new Date().toISOString(),
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
        user,
        session: sessionToken,
        password: generatedPassword,
        note: 'MVP: Auth is client-side only. Save your password!'
      })
    };

  } catch (err) {
    console.error('Signup error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error: ' + err.message })
    };
  }
};
