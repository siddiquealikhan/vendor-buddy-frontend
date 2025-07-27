import React from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const Analytics = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          className="px-4 py-2 mb-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mt-4">Analytics</h1>
        <p className="text-gray-600">Analytics dashboard coming soon...</p>
      </div>
    </div>
  )
}

export default Analytics
