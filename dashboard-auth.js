// Dashboard Authentication and API Integration

// Check authentication on page load
async function checkAuth() {
  const session = localStorage.getItem('postpilot_session');
  if (!session) {
    window.location.href = '/login.html';
    return null;
  }

  try {
    const response = await fetch('/.netlify/functions/auth-verify', {
      headers: {
        'Authorization': `Bearer ${session}`
      }
    });

    if (!response.ok) {
      throw new Error('Session expired');
    }

    const data = await response.json();
    return data.user;
  } catch (err) {
    console.error('Auth check failed:', err);
    localStorage.removeItem('postpilot_session');
    localStorage.removeItem('postpilot_user');
    window.location.href = '/login.html';
    return null;
  }
}

// Update user UI
function updateUserUI(user) {
  // Update stats
  document.getElementById('postsGenerated').textContent = user.subscription.postsGenerated || 0;
  document.getElementById('postsLimit').textContent = user.subscription.postsLimit || 30;
  
  // Update trial status
  const trialStatus = document.getElementById('trialStatus');
  if (user.subscription.status === 'trial') {
    const daysLeft = Math.ceil((new Date(user.subscription.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24));
    trialStatus.textContent = `${daysLeft} days left`;
  } else if (user.subscription.status === 'active') {
    trialStatus.textContent = 'Active';
  } else {
    trialStatus.textContent = 'Expired';
  }
  
  // Update user email in menu
  const userEmail = document.querySelector('.user-email');
  if (userEmail) {
    userEmail.textContent = user.email;
  }
}

// Logout
function logout() {
  localStorage.removeItem('postpilot_session');
  localStorage.removeItem('postpilot_user');
  window.location.href = '/login.html';
}

// Initialize on page load
let currentUser = null;

window.addEventListener('DOMContentLoaded', async () => {
  currentUser = await checkAuth();
  if (currentUser) {
    updateUserUI(currentUser);
  }
});
