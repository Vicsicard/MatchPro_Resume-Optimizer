# Stripe Checkout for Subscriptions Guide

## Quick Implementation Steps

1. **Create a Checkout Session (Server-side)**
```javascript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',  // Important! This enables subscription mode
  payment_method_types: ['card'],
  line_items: [{
    price: 'price_H5ggYwtDq4fbrJ',  // Your price ID from Stripe Dashboard
    quantity: 1,
  }],
  success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://example.com/cancel',
});
```

2. **Redirect to Checkout (Client-side)**
```javascript
// When your customer clicks the button
window.location.href = session.url;
```

## Key Points for Subscription Implementation

1. **Price IDs**
   - Create products and prices in Stripe Dashboard
   - Use `mode: 'subscription'` for recurring payments
   - Test with price IDs starting with `price_test_`

2. **Required Parameters**
   - `mode: 'subscription'`
   - `success_url` with `{CHECKOUT_SESSION_ID}`
   - `cancel_url`
   - At least one `line_items` with price and quantity

3. **Webhook Events to Handle**
```javascript
// Listen for these events
checkout.session.completed
customer.subscription.created
invoice.paid
```

## Common Issues

1. **500 Error Checklist**
   - Verify STRIPE_SECRET_KEY is correct and accessible
   - Confirm price IDs exist in your Stripe account
   - Check success_url and cancel_url are valid URLs
   - Ensure proper CORS configuration

2. **Testing**
   - Use test cards: 4242 4242 4242 4242
   - Expiry: Any future date
   - CVC: Any 3 digits

## Documentation Links

1. Main Guide: https://stripe.com/docs/checkout/quickstart
2. Subscriptions: https://stripe.com/docs/billing/subscriptions/checkout
3. Testing: https://stripe.com/docs/testing#cards

Remember: Checkout Sessions are single-use. Create a new session for each purchase attempt.
