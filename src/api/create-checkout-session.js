import Stripe from 'stripe';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

export async function createCheckoutSession(req, res) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Resume Optimizer Starter',
              description: 'Access to starter resume optimization features with 10 optimizations',
            },
            unit_amount: 1999, // $19.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.VITE_BASEURL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_BASEURL}/cancel`,
      metadata: {
        package: 'premium',
      },
    });

    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}