import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const CartPage = ({ cart, onRemove }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const total = cart.reduce((sum, item) => sum + (item.unitPrice || item.price) * item.qty, 0)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 py-8 flex-1">
        <button className="mb-6 btn btn-outline" onClick={() => navigate(-1)}>&larr; Back</button>
        <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
        {cart.length === 0 ? (
          <div className="text-gray-500 text-center py-16">Your cart is empty.</div>
        ) : (
          <ul className="divide-y divide-gray-200 mb-8">
            {cart.map(item => (
              <li key={item.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <img src={item.imageUrl || item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs text-gray-500">by {item.supplierId || item.supplier}</div>
                    <div className="text-xs text-gray-500">Qty: {item.qty}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-primary-600">₹{(item.unitPrice || item.price) * item.qty}</span>
                  <button className="text-xs text-red-500 mt-1" onClick={() => onRemove(item.id)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-between items-center border-t pt-4">
          <span className="font-bold text-lg">Total:</span>
          <span className="font-bold text-primary-600 text-lg">₹{total}</span>
        </div>
        <div className="mt-8 flex flex-col gap-4">
          {!user ? (
            <button
              className="btn btn-primary w-full"
              disabled={cart.length === 0}
              onClick={() => navigate('/login', { state: { from: '/payment' } })}
            >
              Log In and Continue to Payment
            </button>
          ) : (
            <button
              className="btn btn-primary w-full"
              disabled={cart.length === 0}
              onClick={() => navigate('/enter-address', { state: { cart } })}
            >
              Continue to Payment
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartPage
