import React, { useState } from 'react';
import { Button } from '../ui/button';

const PremiumCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('Starting checkout process...');
      
      const response = await fetch('http://localhost:3000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/upload`,
          cancelUrl: `${window.location.origin}/pricing`
        })
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create checkout session');
      }

      const { url } = responseData;
      console.log('Received checkout URL:', url);
      
      if (url) {
        console.log('Redirecting to Stripe checkout...');
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      setError(error.message || 'Failed to start checkout process');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      >
        {isLoading ? 'Processing...' : 'Get Premium Access'}
      </Button>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default PremiumCheckout;