// User Signup with Supabase
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
    const { email, password, businessName } = JSON.parse(event.body);

    // Validation
    if (!email || !password || !businessName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email, password, and business name are required' })
      };
    }

    if (password.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Password must be at least 8 characters' })
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          business_name: businessName
        }
      }
    });

    if (authError) {
      console.error('Supabase signup error:', authError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: authError.message })
      };
    }

    // Create user profile in database
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        email: email.toLowerCase(),
        business_name: businessName,
        subscription_status: 'trial',
        subscription_plan: 'starter',
        trial_ends_at: trialEndsAt,
        posts_generated: 0,
        posts_limit: 50,
        billing_period_start: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Try to clean up auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authData.user.id);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create user profile' })
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
          businessName: businessName,
          subscription: {
            status: 'trial',
            plan: 'starter',
            trialEndsAt: trialEndsAt,
            postsGenerated: 0,
            postsLimit: 50
          }
        },
        session: {
          token: authData.session.access_token,
          refreshToken: authData.session.refresh_token
        }
      })
    };

  } catch (err) {
    console.error('Signup error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error: ' + err.message })
    };
  }
};
