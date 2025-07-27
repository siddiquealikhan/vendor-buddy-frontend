import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

// Components
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SupplierDashboard from './pages/SupplierDashboard'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Orders from './pages/Orders'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import CartPage from './pages/CartPage'
import EnterAddress from './pages/EnterAddress'
import DummyPayment from './pages/DummyPayment'
import SupplierProducts from './pages/SupplierProducts';
import SupplierAnalytics from './pages/SupplierAnalytics';
import SupplierOrders from './pages/SupplierOrders';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Help from './pages/Help';
import Terms from './pages/Terms';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext'

// API Configuration
// Remove or update default axios baseURL to use deployed backend
axios.defaults.baseURL = 'https://https-github-com-siddiquealikhan-vendor.onrender.com/api'

// Add auth token to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

function AppRoutes() {
  const { user, loading } = useAuth()
  const [cart, setCart] = useState([])

  // Remove item from cart handler
  const handleRemoveFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Pass cart and handlers to Home and CartPage
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public home page route */}
      <Route path="/" element={<Home cart={cart} setCart={setCart} />} />
      {/* New static info pages */}
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/help" element={<Help />} />
      <Route path="/terms" element={<Terms />} />

      {/* Dashboard - Show different dashboard based on user role */}
      <Route path="/dashboard" element={
        !user ? <Navigate to="/login" /> :
        user.role === 'SUPPLIER' ? <SupplierDashboard /> : <Navigate to="/orders" />
      } />

      {/* Supplier-specific routes */}
      {user && user.role === 'SUPPLIER' && (
        <>
          <Route path="/products" element={<SupplierProducts />} />
          <Route path="/analytics" element={<SupplierAnalytics />} />
          <Route path="/orders" element={<SupplierOrders />} />
        </>
      )}
      {/* Orders with its own header (no sidebar) for vendors */}
      {user && user.role !== 'SUPPLIER' && (
        <Route path="/orders" element={<Orders cart={cart} />} />
      )}

      {/* Cart page with its own navigation */}
      <Route path="/cart" element={
        <CartPage cart={cart} onRemove={handleRemoveFromCart} isLoggedIn={!!user} />
      } />
      <Route path="/enter-address" element={<EnterAddress cart={cart} />} />
      <Route path="/payment" element={<DummyPayment />} />

      {/* Other protected routes inside Layout */}
      <Route
        element={
          user ? <Layout /> : <Navigate to="/login" />
        }
      >
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App