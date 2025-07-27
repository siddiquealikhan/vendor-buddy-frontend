import React from 'react';
import { useNavigate } from 'react-router-dom';

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-lg p-8 card">
        <h2 className="text-2xl font-bold mb-6">Help Center</h2>
        <p className="mb-4">Need help? Browse our FAQs or contact support at <span className='text-primary-600'>siddiquealikhan71@hotmail.com</span>.</p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>How to place an order</li>
          <li>How to track your order</li>
          <li>How to become a supplier</li>
          <li>Account and profile management</li>
        </ul>
      </div>
      <div className="mt-8 flex justify-center">
        <button
          className="btn btn-outline"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Help;
