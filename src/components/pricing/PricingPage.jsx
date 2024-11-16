import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import PremiumCheckout from '../stripe/PremiumCheckout';
import { Check } from 'lucide-react';

const PricingPage = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState(null);
  const { user, isLoading } = useUser();
  const navigate = useNavigate();

  const PRICE_IDS = {
    starter: 'price_1QL9lbGEHfPiJwM4RHobn8DD',
    professional: 'price_1QLDUEGEHfPiJwM4f44jHHOr',
    enterprise: 'price_1QLDUwGEHfPiJwM4ZPNtfSWj'
  };

  const handleStartTrial = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedPriceId(PRICE_IDS.starter);
    setShowCheckout(true);
  };

  const handleUpgrade = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedPriceId(PRICE_IDS.professional);
    setShowCheckout(true);
  };

  const handleEnterprise = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedPriceId(PRICE_IDS.enterprise);
    setShowCheckout(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Choose Your Plan
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Start optimizing your resume today with our powerful AI tools
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6 items-stretch">
          {/* Starter Card */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden h-full">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
              <p className="mt-4 text-gray-600">Perfect for trying out our services</p>
              <p className="mt-8">
                <span className="text-4xl font-bold text-gray-900">$19.99</span>
                <span className="text-gray-600">/month</span>
              </p>
              <button
                onClick={handleStartTrial}
                className="mt-8 block w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Get Started
              </button>
            </div>
            <div className="px-8 pb-8">
              <h4 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
                What's included
              </h4>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    5 Resume Optimizations/month
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Basic ATS Score Analysis
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Standard Resume Templates
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Basic Keyword Optimization
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Email Support
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Professional Card */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-blue-500 h-full">
            <div className="p-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-600 mb-4">
                RECOMMENDED
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Professional</h3>
              <p className="mt-4 text-gray-600">For serious job seekers</p>
              <p className="mt-8">
                <span className="text-4xl font-bold text-gray-900">$39.99</span>
                <span className="text-gray-600">/month</span>
              </p>
              <button
                onClick={handleUpgrade}
                className="mt-8 block w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Upgrade Now
              </button>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Unlimited Resume Optimizations
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Advanced AI Analysis & Suggestions
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Premium ATS-Friendly Templates
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Smart Job Matching & Alerts
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Multiple Resume Versions
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Priority Support
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Format Preservation Technology
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Enterprise Card */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden h-full">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
              <p className="mt-4 text-gray-600">For teams and organizations</p>
              <p className="mt-8">
                <span className="text-4xl font-bold text-gray-900">$99.99</span>
                <span className="text-gray-600">/month</span>
              </p>
              <button
                onClick={handleEnterprise}
                className="mt-8 block w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Contact Sales
              </button>
            </div>
            <div className="px-8 pb-8">
              <h4 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
                What's included
              </h4>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Everything in Professional
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Dedicated Account Manager
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Custom API Integration
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Team Analytics Dashboard
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Bulk Resume Processing
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    Custom Template Design
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-gray-600">
                    24/7 Priority Support
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showCheckout && (
        <PremiumCheckout onClose={() => setShowCheckout(false)} priceId={selectedPriceId} />
      )}
    </div>
  );
};

export default PricingPage;