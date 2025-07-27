import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { FaCreditCard, FaUniversity, FaMobileAlt } from 'react-icons/fa';

const paymentOptions = [
  {
    value: 'Credit / Debit Cards',
    label: 'Credit / Debit Cards',
    icon: <FaCreditCard size={20} className="inline mr-2" />,
    description: 'Visa, Mastercard, American Express',
  },
  {
    value: 'UPI',
    label: 'UPI',
    icon: <FaMobileAlt size={20} className="inline mr-2" />,
    description: 'Instant mobile payments (PhonePe, GPay, Paytm)',
  },
  {
    value: 'Bank Transfer',
    label: 'Bank Transfer',
    icon: <FaUniversity size={20} className="inline mr-2" />,
    description: 'Direct bank-to-bank transfers',
  },
];

const DummyPayment = () => {
    const { state } = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [paymentMethod, setPaymentMethod] = useState('UPI')
    const [testInput, setTestInput] = useState('')
    const [confirming, setConfirming] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleConfirm = async () => {
        setError('')
        const token = localStorage.getItem('token')
        if (testInput !== '123') {
            setError('Enter 123 to confirm order')
            return
        }
        setConfirming(true)
        try {
            const { cart, address } = state
            for (const item of cart) {
                await axios.post('/orders', {
                    vendorId: user.id,
                    supplierId: item.supplierId,
                    productName: item.name,
                    quantity: item.qty,
                    price: item.unitPrice || item.price,
                    deliveryAddress: address,
                    paymentMethod,
                    status: 'PENDING',
                    totalAmount: (item.unitPrice || item.price) * item.qty,
                    productId: item.id
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            }
            setSuccess(true)
            setTimeout(() => navigate('/orders', { state: { orderConfirmed: true } }), 1500)
        } catch (e) {
            if (e.response && e.response.data && e.response.data.error) {
                setError('Order failed: ' + e.response.data.error)
            } else {
                setError('Order failed. Please try again.')
            }
        } finally {
            setConfirming(false)
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <div className="w-full max-w-md p-8 card text-center">
                    <h2 className="text-2xl font-bold mb-6 text-red-600">Not logged in</h2>
                    <p className="mb-4">Please log in as a vendor to place an order.</p>
                </div>
            </div>
        )
    }
    if (user.role !== 'VENDOR') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <div className="w-full max-w-md p-8 card text-center">
                    <h2 className="text-2xl font-bold mb-6 text-red-600">Access Denied</h2>
                    <p className="mb-4">Only vendors can place orders. Please log in with a vendor account.</p>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <div className="w-full max-w-md p-8 card text-center">
                    <h2 className="text-2xl font-bold mb-6 text-green-600">Order Confirmed!</h2>
                    <p className="mb-4">Thank you for your order.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="w-full max-w-md p-8 card">
                <h2 className="text-2xl font-bold mb-6">Payment</h2>
                <div className="mb-6">
                  <label className="block mb-2 font-semibold">Select Payment Method:</label>
                  <div className="flex flex-col gap-2">
                    {paymentOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        className={`flex items-center w-full p-3 rounded border transition-all ${paymentMethod === option.value ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white'} hover:border-primary-400`}
                        onClick={() => setPaymentMethod(option.value)}
                      >
                        {option.icon}
                        <span className="font-medium mr-2">{option.label}</span>
                        <span className="text-xs text-gray-500">{option.description}</span>
                        {paymentMethod === option.value && (
                          <span className="ml-auto text-primary-600 font-bold">Selected</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                    <label className="block mb-2 font-semibold">Test Input (enter 123 to confirm):</label>
                    <input
                        className="w-full border rounded p-2"
                        value={testInput}
                        onChange={e => setTestInput(e.target.value)}
                        placeholder="Enter 123 to confirm order"
                    />
                </div>
                {error && <div className="text-red-500 mb-2">{error}</div>}
                <button className="btn btn-primary w-full" onClick={handleConfirm} disabled={confirming}>
                    {confirming ? 'Placing Order...' : 'Confirm Order'}
                </button>
            </div>
        </div>
    )
}

export default DummyPayment
