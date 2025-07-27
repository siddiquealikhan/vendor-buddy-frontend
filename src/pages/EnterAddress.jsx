import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const EnterAddress = ({ cart }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')

  const handleUseRegistered = () => {
    if (user && user.location && user.location.address) {
      setAddress(user.location.address)
    }
  }

  const handleContinue = () => {
    if (!address) return
    navigate('/payment', { state: { address, cart } })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 card">
        <h2 className="text-2xl font-bold mb-6">Enter Shipping Address</h2>
        <textarea
          className="w-full border rounded p-3 mb-4"
          rows={3}
          placeholder="Enter address..."
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
        <button className="btn btn-outline w-full mb-4" onClick={handleUseRegistered}>
          Use Registered Address
        </button>
        <button className="btn btn-primary w-full" onClick={handleContinue} disabled={!address}>
          Continue
        </button>
      </div>
    </div>
  )
}

export default EnterAddress

