const fs = require('fs').promises;

const ORDERS_FILE = '/tmp/orders.json';

async function loadOrders() {
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveOrders(orders) {
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

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
    const { orderId, status, previewUrl, websiteUrl } = JSON.parse(event.body);

    if (!orderId || !status) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Load orders
    const orders = await loadOrders();
    
    // Find and update order
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Order not found' })
      };
    }

    // Update order
    orders[orderIndex] = {
      ...orders[orderIndex],
      status,
      previewUrl: previewUrl || orders[orderIndex].previewUrl,
      websiteUrl: websiteUrl || orders[orderIndex].websiteUrl,
      updatedAt: new Date().toISOString()
    };

    // Save orders
    await saveOrders(orders);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        order: orders[orderIndex]
      })
    };
  } catch (error) {
    console.error('Update order error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
