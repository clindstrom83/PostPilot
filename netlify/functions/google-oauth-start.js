// Initiate Google Business Profile OAuth flow

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.SITE_URL}/.netlify/functions/google-oauth-callback`;

    if (!clientId) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Google OAuth not configured' })
      };
    }

    // Build OAuth URL
    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const oauthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + 
      new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scopes.join(' '),
        access_type: 'offline',
        prompt: 'consent',
        state: event.queryStringParameters?.userId || 'unknown'
      });

    // Redirect to Google OAuth
    return {
      statusCode: 302,
      headers: {
        ...headers,
        Location: oauthUrl
      },
      body: ''
    };

  } catch (error) {
    console.error('OAuth start error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
