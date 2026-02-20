// Dashboard Authentication and API Integration

// Check authentication on page load (MVP: Client-side only)
async function checkAuth() {
  const session = localStorage.getItem('postpilot_session');
  const userJson = localStorage.getItem('postpilot_user');
  
  if (!session || !userJson) {
    // Show modal before redirecting
    if (typeof showModal === 'function') {
      showModal(
        'Authentication Required',
        'Please log in to access your dashboard.',
        '🔒',
        'Go to Login',
        () => { window.location.href = '/login.html'; }
      );
    } else {
      window.location.href = '/login.html';
    }
    return null;
  }

  try {
    // MVP: Just use localStorage data directly, no server verification
    const user = JSON.parse(userJson);
    return user;
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
  // Update stats (with safety checks)
  const postsGenEl = document.getElementById('postsGenerated') || document.getElementById('responsesGenerated');
  const postsLimitEl = document.getElementById('postsLimit');
  
  if (postsGenEl) {
    postsGenEl.textContent = (user.subscription && user.subscription.postsGenerated) || 0;
  }
  
  if (postsLimitEl) {
    postsLimitEl.textContent = (user.subscription && user.subscription.postsLimit) || 50;
  }
  
  // Update trial status if element exists
  const trialStatus = document.getElementById('trialStatus');
  if (trialStatus && user.subscription) {
    if (user.subscription.status === 'trial') {
      const daysLeft = Math.ceil((new Date(user.subscription.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24));
      trialStatus.textContent = `${daysLeft} days left`;
    } else if (user.subscription.status === 'active') {
      trialStatus.textContent = 'Active';
    } else {
      trialStatus.textContent = 'Expired';
    }
  }
  
  // Update user email in menu if it exists
  const userEmail = document.querySelector('.user-email');
  if (userEmail && user.email) {
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
