// Stripe Webhook Handler
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Webhook signature verification failed' })
    };
  }

  // Handle the event
  try {
    switch (stripeEvent.type) {
      case 'customer.subscription.created':
        const subscriptionCreated = stripeEvent.data.object;
        console.log('Subscription created:', subscriptionCreated.id);
        // TODO: Update user record in database
        break;

      case 'customer.subscription.updated':
        const subscriptionUpdated = stripeEvent.data.object;
        console.log('Subscription updated:', subscriptionUpdated.id);
        // TODO: Update user subscription status
        break;

      case 'customer.subscription.deleted':
        const subscriptionDeleted = stripeEvent.data.object;
        console.log('Subscription canceled:', subscriptionDeleted.id);
        // TODO: Revoke user access
        break;

      case 'invoice.payment_succeeded':
        const invoice = stripeEvent.data.object;
        console.log('Payment succeeded:', invoice.id);
        // TODO: Log payment, extend subscription
        break;

      case 'invoice.payment_failed':
        const failedInvoice = stripeEvent.data.object;
        console.log('Payment failed:', failedInvoice.id);
        // TODO: Notify user, send email
        break;

      case 'checkout.session.completed':
        const session = stripeEvent.data.object;
        console.log('Checkout completed:', session.id);
        // TODO: Activate user account
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Webhook handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
