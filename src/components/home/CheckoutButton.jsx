import React from 'react';
import { useNavigate } from 'react-router-dom';

const CheckoutButton = () => {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => navigate('/upload')}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Try for Free
      </button>
      <button
        onClick={() => navigate('/pricing')}
        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
      >
        Get Premium Access
      </button>
    </>
  );
};

export default CheckoutButton;