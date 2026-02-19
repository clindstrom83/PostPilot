// Save Generated Post
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const POSTS_DIR = '/tmp/postpilot-posts';
const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'default-key-change-in-production';

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function ensurePostsDir(userId) {
  const userPostsDir = path.join(POSTS_DIR, userId);
  try {
    await fs.mkdir(userPostsDir, { recursive: true });
  } catch (err) {
    // Directory exists
  }
  return userPostsDir;
}

async function savePost(userId, post) {
  const userPostsDir = await ensurePostsDir(userId);
  const postId = crypto.randomUUID();
  const postData = {
    id: postId,
    ...post,
    createdAt: new Date().toISOString()
  };
  
  const filepath = path.join(userPostsDir, `${postId}.json`);
  await fs.writeFile(filepath, JSON.stringify(postData, null, 2));
  return postData;
}

async function getUserPosts(userId) {
  try {
    const userPostsDir = path.join(POSTS_DIR, userId);
    const files = await fs.readdir(userPostsDir);
    const posts = [];
    
    for (const file of files) {
      const filepath = path.join(userPostsDir, file);
      const data = await fs.readFile(filepath, 'utf8');
      posts.push(JSON.parse(data));
    }
    
    // Sort by createdAt desc
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return posts;
  } catch (err) {
    return [];
  }
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No authorization token provided' })
      };
    }

    const sessionData = authHeader.substring(7);
    const decrypted = decrypt(sessionData);
    const session = JSON.parse(decrypted);
    
    if (session.expiresAt < Date.now()) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Session expired' })
      };
    }

    if (event.httpMethod === 'GET') {
      const posts = await getUserPosts(session.userId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, posts })
      };
    }

    if (event.httpMethod === 'POST') {
      const { content, platform, tone } = JSON.parse(event.body);
      
      if (!content) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Content is required' })
        };
      }

      const post = await savePost(session.userId, { content, platform, tone });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, post })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (err) {
    console.error('Save post error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
