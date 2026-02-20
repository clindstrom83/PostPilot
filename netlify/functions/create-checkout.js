// Create Stripe Checkout Session with Trial
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
    const { email, plan } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    // Determine price based on plan (default to Starter)
    const priceId = plan === 'pro' 
      ? process.env.STRIPE_PRICE_ID_PRO || 'price_1T2h2kRztedIDFZCEUQ8PUS0'
      : process.env.STRIPE_PRICE_ID_STARTER || 'price_1T2h2aRztedIDFZCuu8cd5Nn';

    const siteUrl = process.env.SITE_URL || 'https://reviewpilot.business';

    // Create Checkout Session with trial
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      subscription_data: {
        trial_period_days: 7,
        trial_settings: {
          end_behavior: {
            missing_payment_method: 'cancel',
          },
        },
      },
      success_url: `${siteUrl}/dashboard.html?checkout=success`,
      cancel_url: `${siteUrl}/signup.html?checkout=cancelled`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        email: email,
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url
      })
    };

  } catch (err) {
    console.error('Stripe checkout error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create checkout session: ' + err.message })
    };
  }
};
