const { getOrdersByEmail } = require('./lib/storage-simple');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const email = event.queryStringParameters?.email;

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email required' })
      };
    }

    const customerOrders = await getOrdersByEmail(email);

    if (customerOrders.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No orders found for this email' })
      };
    }

    // Return most recent order
    const latestOrder = customerOrders.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )[0];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        order: latestOrder,
        totalOrders: customerOrders.length
      })
    };
  } catch (error) {
    console.error('Get order error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
