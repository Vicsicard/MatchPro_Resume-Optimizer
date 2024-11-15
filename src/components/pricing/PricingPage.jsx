import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import PremiumCheckout from '../stripe/PremiumCheckout';
import { Check } from 'lucide-react';

const PricingPage = () => {
  const navigate = useNavigate();

  const handleFreeTrial = () => {
    navigate('/upload');
  };

  const pricingTiers = [
    {
      name: 'Free Trial',
      price: '$0',
      credits: 1,
      features: [
        '1 resume optimization',
        'Basic ATS analysis',
        'Standard formatting'
      ],
      action: handleFreeTrial,
      buttonText: 'Start Free Trial',
      priceId: null
    },
    {
      name: 'Starter',
      price: '$19.99',
      credits: 20,
      features: [
        '20 resume optimizations',
        'Advanced ATS optimization',
        'AI-powered suggestions',
        'Premium formatting templates'
      ],
      priceId: import.meta.env.VITE_STRIPE_PRICE_STARTER
    },
    {
      name: 'Professional',
      price: '$39.99',
      credits: 50,
      features: [
        '50 resume optimizations',
        'Advanced ATS optimization',
        'AI-powered suggestions',
        'Premium formatting templates',
        'Priority support'
      ],
      priceId: import.meta.env.VITE_STRIPE_PRICE_PROFESSIONAL,
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99.99',
      credits: 200,
      features: [
        '200 resume optimizations',
        'Advanced ATS optimization',
        'AI-powered suggestions',
        'Premium formatting templates',
        'Priority support',
        'Bulk processing'
      ],
      priceId: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-blue-600 py-20">
        <div className="container mx-auto text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl opacity-90">Choose the plan that's right for you</p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto -mt-16">
          {pricingTiers.map((tier, index) => (
            <Card key={index} className={`shadow-lg ${tier.popular ? 'border-blue-500 border-2' : 'border-blue-200'} relative`}>
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <div className="mt-2">
                  <p className="text-3xl font-bold">{tier.price}</p>
                  <p className="text-gray-600 text-sm mt-1">{tier.credits} credits</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="text-green-500" size={20} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {tier.priceId ? (
                    <PremiumCheckout priceId={tier.priceId} credits={tier.credits} />
                  ) : (
                    <Button 
                      onClick={tier.action}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                      {tier.buttonText}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">100% Satisfaction Guaranteed</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Try our premium service risk-free. If you're not completely satisfied with your optimized resume,
          we'll make it right or give you a full refund.
        </p>
      </div>
    </div>
  );
};

export default PricingPage;