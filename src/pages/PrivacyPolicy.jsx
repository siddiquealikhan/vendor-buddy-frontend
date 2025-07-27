import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-2xl p-8 card">
        <h2 className="text-2xl font-bold mb-6">Privacy Policy</h2>
        <p className="mb-4">Your privacy is important to us. This policy explains how Vendor-Buddy collects, uses, and protects your information.</p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>We only collect information necessary to provide our services.</li>
          <li>Your data is never sold to third parties.</li>
          <li>We use secure technologies to protect your information.</li>
          <li>You can request deletion of your data at any time by contacting us.</li>
        </ul>
        <p className="text-gray-500">For questions, email us at siddiquealikhan71@hotmail.com.</p>
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

export default PrivacyPolicy;
