// Create Stripe products for ReviewPilot
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
  console.log('Creating Stripe products...\n');

  try {
    // Create Starter Product
    console.log('Creating Starter plan...');
    const starterProduct = await stripe.products.create({
      name: 'ReviewPilot Starter',
      description: '50 AI review responses per month with Google Business Profile integration'
    });

    const starterPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 4900, // $49.00
      currency: 'usd',
      recurring: {
        interval: 'month',
        trial_period_days: 7
      }
    });

    console.log('✅ Starter Plan Created:');
    console.log('   Product ID:', starterProduct.id);
    console.log('   Price ID:', starterPrice.id);
    console.log('');

    // Create Pro Product
    console.log('Creating Pro plan...');
    const proProduct = await stripe.products.create({
      name: 'ReviewPilot Pro',
      description: '150 AI review responses per month with multiple locations and advanced features'
    });

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 9900, // $99.00
      currency: 'usd',
      recurring: {
        interval: 'month',
        trial_period_days: 7
      }
    });

    console.log('✅ Pro Plan Created:');
    console.log('   Product ID:', proProduct.id);
    console.log('   Price ID:', proPrice.id);
    console.log('');

    console.log('════════════════════════════════════════');
    console.log('COPY THESE TO NETLIFY ENVIRONMENT VARS:');
    console.log('════════════════════════════════════════');
    console.log('STRIPE_PRICE_ID_STARTER=' + starterPrice.id);
    console.log('STRIPE_PRICE_ID_PRO=' + proPrice.id);
    console.log('');

  } catch (error) {
    console.error('❌ Error creating products:', error.message);
    process.exit(1);
  }
}

createProducts();
