// User Login with Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event) => {
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
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and password are required' })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Supabase login error:', authError);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' })
      };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch user profile' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          businessName: profile.business_name,
          subscription: {
            status: profile.subscription_status,
            plan: profile.subscription_plan,
            trialEndsAt: profile.trial_ends_at,
            postsGenerated: profile.posts_generated,
            postsLimit: profile.posts_limit
          }
        },
        session: {
          token: authData.session.access_token,
          refreshToken: authData.session.refresh_token
        }
      })
    };

  } catch (err) {
    console.error('Login error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error: ' + err.message })
    };
  }
};
