// Simple file storage (works without Blobs)
const fs = require('fs').promises;
const crypto = require('crypto');

const ORDERS_FILE = '/tmp/reviewpilot-orders.json';
const TOKENS_FILE = '/tmp/reviewpilot-tokens.json';

// Orders functions
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

async function getOrdersByEmail(email) {
  const orders = await loadOrders();
  return orders.filter(order => 
    order.customerEmail?.toLowerCase() === email.toLowerCase()
  );
}

async function getOrderById(orderId) {
  const orders = await loadOrders();
  return orders.find(order => order.id === orderId);
}

async function updateOrder(orderId, updates) {
  const orders = await loadOrders();
  const index = orders.findIndex(o => o.id === orderId);
  
  if (index === -1) return null;
  
  orders[index] = {
    ...orders[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  await saveOrders(orders);
  return orders[index];
}

async function createOrder(orderData) {
  const orders = await loadOrders();
  const newOrder = {
    id: `order_${Date.now()}`,
    ...orderData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  orders.push(newOrder);
  await saveOrders(orders);
  return newOrder;
}

// Token functions
async function loadTokens() {
  try {
    const data = await fs.readFile(TOKENS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function saveTokens(tokens) {
  await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

async function cleanExpiredTokens() {
  const tokens = await loadTokens();
  const now = Date.now();
  let cleaned = false;
  
  Object.keys(tokens).forEach(token => {
    if (tokens[token].expires < now) {
      delete tokens[token];
      cleaned = true;
    }
  });
  
  if (cleaned) {
    await saveTokens(tokens);
  }
  
  return tokens;
}

async function createToken(email, expiryMs) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokens = await cleanExpiredTokens();
  
  tokens[token] = {
    email: email.toLowerCase(),
    expires: Date.now() + expiryMs,
    createdAt: new Date().toISOString()
  };
  
  await saveTokens(tokens);
  return token;
}

async function verifyToken(token) {
  const tokens = await loadTokens();
  const tokenData = tokens[token];
  
  if (!tokenData) return null;
  if (tokenData.expires < Date.now()) {
    delete tokens[token];
    await saveTokens(tokens);
    return null;
  }
  
  return tokenData;
}

async function deleteToken(token) {
  const tokens = await loadTokens();
  delete tokens[token];
  await saveTokens(tokens);
}

module.exports = {
  // Orders
  loadOrders,
  saveOrders,
  getOrdersByEmail,
  getOrderById,
  updateOrder,
  createOrder,
  
  // Tokens
  loadTokens,
  saveTokens,
  cleanExpiredTokens,
  createToken,
  verifyToken,
  deleteToken
};
