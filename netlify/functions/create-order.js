const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs').promises;
const path = require('path');

// Simple file-based storage for MVP (will migrate to proper DB later)
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
    const { sessionId } = JSON.parse(event.body);

    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing session ID' })
      };
    }

    // Get Stripe session details
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription']
    });

    if (!session || session.payment_status !== 'paid') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Payment not completed' })
      };
    }

    // Load existing orders
    const orders = await loadOrders();

    // Handle customer ID (might be string or object depending on expand)
    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id;
    
    const customerEmail = session.customer_email 
      || (typeof session.customer === 'object' ? session.customer.email : null);

    // Create new order
    const order = {
      id: `order_${Date.now()}`,
      customerId: customerId,
      customerEmail: customerEmail,
      customerName: session.metadata?.customer_name || 'Customer',
      plan: session.metadata?.plan || 'starter',
      status: 'pending', // pending, in_progress, preview_ready, live
      websiteUrl: null,
      previewUrl: null,
      deliveryTime: getDeliveryTime(session.metadata?.plan),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stripeSessionId: sessionId,
      stripeSubscriptionId: session.subscription?.id,
      setupAmount: session.metadata?.setup_amount,
      monthlyAmount: session.metadata?.monthly_amount
    };

    orders.push(order);
    await saveOrders(orders);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        order 
      })
    };
  } catch (error) {
    console.error('Order creation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

function getDeliveryTime(plan) {
  switch(plan) {
    case 'starter': return '72 hours';
    case 'pro': return '48 hours';
    case 'enterprise': return '24 hours';
    default: return '48 hours';
  }
}
