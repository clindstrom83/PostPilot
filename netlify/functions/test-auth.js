// Test endpoint to check if auth is working
const fs = require('fs').promises;

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const data = await fs.readFile('/tmp/reviewpilot-users.json', 'utf8');
    const users = JSON.parse(data);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'File storage working',
        userCount: Object.keys(users).length,
        users: Object.keys(users) // Just show emails, not passwords
      })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'No users yet',
        userCount: 0,
        users: []
      })
    };
  }
};
