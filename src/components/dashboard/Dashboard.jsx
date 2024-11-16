import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Dashboard() {
  const location = useLocation();
  const message = location.state?.message;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Welcome to Your Dashboard
          </h1>
          {message && (
            <div className="mt-4 p-4 bg-blue-100 text-blue-700 rounded-md">
              {message}
            </div>
          )}
        </div>
        
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Add dashboard content here */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Credits</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your available optimization credits
              </p>
              <div className="mt-3 text-3xl font-semibold">10</div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Optimizations</h3>
              <p className="mt-2 text-sm text-gray-500">
                Total resumes optimized
              </p>
              <div className="mt-3 text-3xl font-semibold">0</div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your current plan
              </p>
              <div className="mt-3 text-3xl font-semibold">Free Trial</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
