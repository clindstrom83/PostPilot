// Test endpoint to check if auth is working
const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const store = getStore('users');
    const users = await store.get('users', { type: 'json' }) || {};
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Blobs working',
        userCount: Object.keys(users).length,
        users: Object.keys(users) // Just show emails, not passwords
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: error.message,
        stack: error.stack
      })
    };
  }
};
