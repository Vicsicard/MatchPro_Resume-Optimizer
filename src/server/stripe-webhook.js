import { stripe } from './server.js';
import express from 'express';
import { addOptimizationCredits } from './api-routes.js';

const router = express.Router();

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    console.log('Webhook received:', event.type);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('💰 PaymentIntent successful:', paymentIntent.id);
        // Add your business logic here
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.error('❌ Payment failed:', {
          id: failedPayment.id,
          error: failedPayment.last_payment_error?.message
        });
        break;

      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('✅ Checkout session completed:', session.id);
        
        // Add credits to user account
        if (session.metadata?.userId && session.metadata?.credits) {
          try {
            const credits = parseInt(session.metadata.credits, 10);
            await addOptimizationCredits(session.metadata.userId, credits);
            console.log('✅ Added', credits, 'credits for user:', session.metadata.userId);
          } catch (error) {
            console.error('❌ Failed to add credits:', error);
            // Don't throw here - we still want to acknowledge the webhook
          }
        } else {
          console.warn('⚠️ Missing userId or credits in session metadata');
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.json({received: true});
  } catch (err) {
    console.error(`❌ Error processing webhook ${event.type}:`, err);
    // Still return 200 as we don't want Stripe to retry
    response.json({received: true, error: err.message});
  }
});

export default router;
