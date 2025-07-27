import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from 'react-query'
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { productsAPI, ordersAPI, analyticsAPI } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import Header from '../components/Header'
import { useNavigate } from 'react-router-dom'

const Dashboard = ({ cart = [] }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Fetch data based on user role
  const { data: products, isLoading: productsLoading } = useQuery(
    ['products', 'dashboard'],
    () => productsAPI.getAll({ page: 0, size: 5 }),
    { enabled: user?.role === 'SUPPLIER' }
  )

  const { data: orders, isLoading: ordersLoading } = useQuery(
    ['orders', 'dashboard'],
    () => ordersAPI.getAll({ page: 0, size: 5 }),
    { enabled: !!user }
  )

  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    ['analytics', 'dashboard'],
    () => analyticsAPI.getDemandTrends(),
    { enabled: user?.role === 'SUPPLIER' }
  )

  const stats = [
    {
      name: 'Total Products',
      value: products?.totalElements || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Total Orders',
      value: orders?.totalElements || 0,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Revenue',
      value: `₹${analytics?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Active Users',
      value: '1,234',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  const recentOrders = orders?.content || []
  const recentProducts = products?.content || []

  if (productsLoading || ordersLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Add Header at the top */}
      <Header cart={cart} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button */}
        <button
          className="px-4 py-2 mb-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>

        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-primary-100">
              Here's what's happening with your {user?.role?.toLowerCase()} business today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              </div>
              <div className="card-body">
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            order.status === 'DELIVERED' ? 'bg-green-100' :
                            order.status === 'PENDING' ? 'bg-yellow-100' :
                            'bg-gray-100'
                          }`}>
                            {order.status === 'DELIVERED' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : order.status === 'PENDING' ? (
                              <Clock className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Order #{order.id.slice(-6)}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">₹{order.totalAmount}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by placing your first order.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Products (Supplier Only) */}
            {user?.role === 'SUPPLIER' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Products</h3>
                </div>
                <div className="card-body">
                  {recentProducts.length > 0 ? (
                    <div className="space-y-4">
                      {recentProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-blue-100">
                              <Package className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">₹{product.unitPrice}</p>
                            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No products yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Start by adding your first product.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 gap-4">
                  {user?.role === 'VENDOR' ? (
                    <>
                      <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Package className="h-6 w-6 text-primary-600 mb-2" />
                        <p className="text-sm font-medium text-gray-900">Browse Products</p>
                      </button>
                      <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <TrendingUp className="h-6 w-6 text-primary-600 mb-2" />
                        <p className="text-sm font-medium text-gray-900">View Price Trends</p>
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Package className="h-6 w-6 text-primary-600 mb-2" />
                        <p className="text-sm font-medium text-gray-900">Add Product</p>
                      </button>
                      <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <BarChart3 className="h-6 w-6 text-primary-600 mb-2" />
                        <p className="text-sm font-medium text-gray-900">View Analytics</p>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-green-100">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order #123456 delivered</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New product added</p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-yellow-100">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order #123457 pending</p>
                      <p className="text-xs text-gray-500">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard