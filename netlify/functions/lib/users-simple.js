// Simple file-based user storage (works without Blobs)
const fs = require('fs').promises;
const crypto = require('crypto');
const path = require('path');

const USERS_FILE = '/tmp/reviewpilot-users.json';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function loadUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function saveUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function createUser(name, email, password) {
  const users = await loadUsers();
  const emailLower = email.toLowerCase();
  
  if (users[emailLower]) {
    throw new Error('Account with this email already exists');
  }
  
  const userId = `user_${Date.now()}`;
  const passwordHash = hashPassword(password);
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000;
  
  users[emailLower] = {
    id: userId,
    name: name,
    email: emailLower,
    passwordHash: passwordHash,
    createdAt: new Date().toISOString(),
    sessions: {
      [sessionToken]: {
        expires: Date.now() + SESSION_EXPIRY,
        createdAt: new Date().toISOString()
      }
    }
  };
  
  await saveUsers(users);
  
  return {
    user: {
      id: userId,
      name: name,
      email: emailLower
    },
    sessionToken
  };
}

async function loginUser(email, password) {
  const users = await loadUsers();
  const emailLower = email.toLowerCase();
  const user = users[emailLower];
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  const passwordHash = hashPassword(password);
  
  if (user.passwordHash !== passwordHash) {
    throw new Error('Invalid email or password');
  }
  
  // Create new session
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000;
  
  if (!user.sessions) {
    user.sessions = {};
  }
  
  user.sessions[sessionToken] = {
    expires: Date.now() + SESSION_EXPIRY,
    createdAt: new Date().toISOString()
  };
  
  // Clean old sessions
  Object.keys(user.sessions).forEach(token => {
    if (user.sessions[token].expires < Date.now()) {
      delete user.sessions[token];
    }
  });
  
  // Save updated user
  users[emailLower] = user;
  await saveUsers(users);
  
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    sessionToken
  };
}

module.exports = {
  createUser,
  loginUser,
  hashPassword
};
