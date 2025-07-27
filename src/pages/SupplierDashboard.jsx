import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useQuery, useQueryClient } from 'react-query'
import {
  Package,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'
import { productsAPI, ordersAPI, analyticsAPI } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const SupplierDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showAddProductDialog, setShowAddProductDialog] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    imageUrl: '',
    unitPrice: '',
    stock: '100',
    supplierId: user?.id || '',
    supplierName: user?.name || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Fetch data for supplier
  console.log("Current user:", user);
  console.log("User ID being used for product fetch:", user?.id);

  const { data: productsData, isLoading: productsLoading } = useQuery(
    ['products', 'supplier', user?.id],
    () => productsAPI.getBySupplier(user?.id),
    {
      enabled: !!user?.id && user?.role === 'SUPPLIER',
      onError: (error) => console.error('Error fetching supplier products:', error),
      onSuccess: (data) => console.log("Products fetched successfully:", data)
    }
  )

  // Handle both array and object response
  const products = Array.isArray(productsData?.data)
    ? productsData.data
    : productsData?.data?.products || [];
  const productCount = products.length;
  const recentProducts = products.slice(0, 5);

  // Fetch all orders for this supplier
  const { data: supplierOrdersData, isLoading: supplierOrdersLoading } = useQuery(
    ['orders', 'supplier', user?.id],
    () => ordersAPI.getAll({ supplierId: user?.id, page: 0, size: 100 }),
    {
      enabled: !!user?.id && user?.role === 'SUPPLIER',
      onError: (error) => console.error('Error fetching supplier orders:', error),
    }
  )

  // Defensive: handle array/object response
  const supplierOrders = Array.isArray(supplierOrdersData?.data?.orders)
    ? supplierOrdersData.data.orders
    : supplierOrdersData?.data?.content || [];

  // Calculate stats
  const orderCount = supplierOrders.length;
  const revenue = supplierOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const activeCustomers = new Set(supplierOrders.map(order => order.vendorId)).size;
  const recentSupplierOrders = supplierOrders.slice(0, 5);

  const { data: analytics, isLoading: analyticsLoading } = useQuery(
    ['analytics', 'dashboard'],
    () => analyticsAPI.getDemandTrends(),
    { enabled: user?.role === 'SUPPLIER' }
  )

  const stats = [
    {
      name: 'Total Products',
      value: productCount,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Total Orders',
      value: orderCount,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Revenue',
      value: `₹${revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Active Customers',
      value: activeCustomers,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  if (productsLoading || supplierOrdersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const handleAddProduct = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    // Validate form fields
    if (!newProduct.name || !newProduct.unitPrice) {
      setError('Product name and price are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Debug: Log the current user information
      console.log("Creating product with user:", user);
      console.log("User ID used for product:", user?.id);

      // Format the product data
      const productData = {
        name: newProduct.name,
        imageUrl: newProduct.imageUrl || "https://cdn.pixabay.com/photo/2016/04/01/10/24/food-1299326_1280.png",
        unitPrice: parseFloat(newProduct.unitPrice),
        stock: parseInt(newProduct.stock, 10),
        supplierId: user?.id || "",  // Keep the actual ID for database relations
        supplierName: newProduct.supplierName || user?.name || "Unknown Supplier",
        category: "Food",
        unitType: "kg",
        deliveryRange: 10,
        description: `Fresh ${newProduct.name} supplied by ${newProduct.supplierName || user?.name || "Supplier"}`
      };

      // Use productsAPI instead of direct axios call
      await productsAPI.create(productData);

      // Invalidate queries to refetch data
      queryClient.invalidateQueries(['products', 'supplier', user?.id]);
      queryClient.invalidateQueries(['analytics', 'dashboard']);

      // Show success message and reset form
      setSuccess(true);
      setNewProduct({
        name: '',
        imageUrl: '',
        unitPrice: '',
        stock: '100',
        supplierId: user?.id || '',
        supplierName: user?.name || ''
      });

      // Close the dialog after a short delay
      setTimeout(() => {
        setShowAddProductDialog(false);
      }, 2000);
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.response?.data?.message || 'Failed to add product. Please ensure you have permission to add products.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a direct API call to get all products from MongoDB
  const fetchAllProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      console.log("All products in database:", response.data);

      // Check if any products have supplierId that matches user.id
      if (response.data && Array.isArray(response.data.products)) {
        const matchingProducts = response.data.products.filter(p => p.supplierId === user?.id);
        console.log("Products matching current user ID:", matchingProducts);
        console.log("Current user ID:", user?.id);

        // Check for other potential supplierIds that might be used
        const uniqueSupplierIds = [...new Set(response.data.products.map(p => p.supplierId))];
        console.log("All unique supplier IDs in products:", uniqueSupplierIds);
      }
    } catch (error) {
      console.error("Error fetching all products:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Custom Header for Supplier - No Cart Icon */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex-1 flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-primary-600 leading-tight">Vendor-Buddy</h1>
          </div>
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Navigation items for supplier */}
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              onClick={() => navigate('/products')}
            >
              <Package className="h-4 w-4" />
              Products
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              onClick={() => navigate('/analytics')}
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              onClick={() => navigate('/orders')}
            >
              <Clock className="h-4 w-4" />
              Orders
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800"
              onClick={() => { logout(); navigate('/login'); }}
            >
              <X className="h-4 w-4" />
              Logout
            </button>
            {/* User information */}
            <div className="flex items-center gap-x-2">
              <span className="text-sm font-medium text-gray-900">
                {user?.name || user?.email || 'Account'}
              </span>
              {user?.role && (
                <span className="text-xs text-gray-500 capitalize">
                  {user.role.toLowerCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Add Product button */}
        <div className="flex justify-end items-center mb-6">
          <button
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
            onClick={() => setShowAddProductDialog(true)}
          >
            <Package className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>

        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-primary-100">
              Here's what's happening with your supplier business today.
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
                {recentSupplierOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentSupplierOrders.map((order) => (
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
                            <p className="font-medium text-gray-900">
                              Order #{order.id.slice(-6)} - {order.productName}
                              <span className="ml-2 text-xs text-gray-500">Qty: {order.quantity}</span>
                              <span className="ml-2 text-xs text-gray-500">Unit Price: ₹{order.price}</span>
                              <span className="ml-2 text-xs text-gray-500">Vendor Address: {order.deliveryAddress}</span>
                            </p>
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
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You haven't received any orders yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Products */}
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
          </div>
        </div>

        {/* Add Product Dialog */}
        {showAddProductDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
                <button
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setShowAddProductDialog(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
                  Product added successfully!
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-600 focus:ring focus:ring-primary-200"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-600 focus:ring focus:ring-primary-200"
                    placeholder="Enter image URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    value={newProduct.unitPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, unitPrice: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-600 focus:ring focus:ring-primary-200"
                    placeholder="Enter unit price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-600 focus:ring focus:ring-primary-200"
                    placeholder="Enter stock quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    value={newProduct.supplierName}
                    onChange={(e) => setNewProduct({ ...newProduct, supplierName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-600 focus:ring focus:ring-primary-200"
                    placeholder="Enter supplier name"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleAddProduct}
                  className="w-full flex items-center justify-center px-4 py-2 rounded-md border border-transparent shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4zm16 0a8 8 0 01-8 8v-8h8z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    'Add Product'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SupplierDashboard
