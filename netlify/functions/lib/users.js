// User storage helper (uses same Blobs store as other data)
const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

const usersStore = () => getStore('users');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function loadUsers() {
  try {
    const store = usersStore();
    const data = await store.get('users', { type: 'json' });
    return data || {};
  } catch (error) {
    console.error('Load users error:', error);
    return {};
  }
}

async function saveUsers(users) {
  try {
    const store = usersStore();
    await store.setJSON('users', users);
    return true;
  } catch (error) {
    console.error('Save users error:', error);
    return false;
  }
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
