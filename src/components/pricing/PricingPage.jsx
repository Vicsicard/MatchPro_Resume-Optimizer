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
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto -mt-16">
          {/* Free Trial Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Free Trial</CardTitle>
              <p className="text-2xl font-bold">$0</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="text-green-500" size={20} />
                    <span>1 resume optimization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-green-500" size={20} />
                    <span>Basic ATS analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-green-500" size={20} />
                    <span>Standard formatting</span>
                  </li>
                </ul>
                <Button 
                  onClick={handleFreeTrial}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Start Free Trial
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Premium Card */}
          <Card className="shadow-lg border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl">Premium</CardTitle>
              <p className="text-2xl font-bold">$19.99</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="text-green-500" size={20} />
                    <span>10 resume optimizations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-green-500" size={20} />
                    <span>Advanced ATS optimization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-green-500" size={20} />
                    <span>AI-powered suggestions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="text-green-500" size={20} />
                    <span>Premium formatting templates</span>
                  </li>
                </ul>
                <PremiumCheckout />
              </div>
            </CardContent>
          </Card>
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