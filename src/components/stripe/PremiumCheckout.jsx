import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useUser } from '../../hooks/useUser';

const PremiumCheckout = ({ priceId, credits }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useUser();

  const handleCheckout = async () => {
    try {
      if (!user?.id) {
        throw new Error('Please sign in to purchase credits');
      }

      setIsLoading(true);
      setError('');
      
      console.log('Starting checkout process...', { priceId, credits });
      
      const response = await fetch('http://localhost:3000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          successUrl: `${window.location.origin}/upload`,
          cancelUrl: `${window.location.origin}/pricing`,
          userId: user.id,
          priceId,
          credits
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
    <div className="flex flex-col items-center space-y-4">
      {error && (
        <div className="text-red-500 bg-red-100 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}
      <Button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      >
        {isLoading ? 'Processing...' : `Get ${credits} Credits`}
      </Button>
    </div>
  );
};

export default PremiumCheckout;