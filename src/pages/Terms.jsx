import React from 'react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-2xl p-8 card">
        <h2 className="text-2xl font-bold mb-6">Terms of Service</h2>
        <p className="mb-4">By using Vendor-Buddy, you agree to our terms and conditions. Please use the platform responsibly and follow all applicable laws.</p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>Do not misuse the platform or attempt unauthorized access.</li>
          <li>All transactions are subject to verification.</li>
          <li>Vendor-Buddy reserves the right to update these terms at any time.</li>
        </ul>
        <p className="text-gray-500">For questions, contact us at siddiquealikhan71@hotmail.com.</p>
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

export default Terms;
