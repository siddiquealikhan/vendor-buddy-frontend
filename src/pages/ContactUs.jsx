import React from 'react';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-lg p-8 card">
        <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
        <p className="mb-4">For any queries, reach out to us at:</p>
        <ul className="list-disc pl-6 text-lg text-primary-600">
          <li>siddiquealikhan71@hotmail.com</li>
          {/* Add more emails as needed */}
        </ul>
        <p className="mt-6 text-gray-500">We usually respond within 1-2 business days.</p>
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

export default ContactUs;
