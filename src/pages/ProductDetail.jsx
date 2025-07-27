import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Star, 
  Truck, 
  Package, 
  MapPin, 
  Calendar,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { productsAPI, ordersAPI, priceTrendsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';
import LoadingSpinner from '../components/LoadingSpinner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Fetch product details
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getProduct(id),
    enabled: !!id,
  });

  // Fetch price trends
  const { data: priceTrends } = useQuery({
    queryKey: ['priceTrends', id],
    queryFn: () => priceTrendsAPI.getPriceTrends(id),
    enabled: !!id,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData) => ordersAPI.createOrder(orderData),
    onSuccess: () => {
      toast.success('Order placed successfully!');
      setShowOrderForm(false);
      setQuantity(1);
      queryClient.invalidateQueries(['orders']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    },
  });

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }

    if (user.role !== 'VENDOR') {
      toast.error('Only vendors can place orders');
      return;
    }

    const orderData = {
      productId: id,
      quantity: parseInt(quantity),
      deliveryAddress: user.location,
      notes: e.target.notes?.value || '',
    };

    createOrderMutation.mutate(orderData);
  };

  if (productLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/products')}
            className="btn btn-primary"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: priceTrends?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Price Trend',
        data: priceTrends?.data || [100, 95, 110, 105, 120, 115],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Price Trends (Last 6 Months)',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return `₹${value}`;
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < Math.floor(product.rating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {product.rating?.toFixed(1) || '0.0'} ({product.reviewCount || 0} reviews)
                </span>
              </div>
            </div>

            {/* Product Image */}
            <div className="mb-6">
              <img
                src={product.imageUrl || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = '/placeholder-product.jpg';
                }}
              />
            </div>

            {/* Product Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  ₹{product.unitPrice}/{product.unitType}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  product.stock > 10 ? "bg-green-100 text-green-800" :
                  product.stock > 0 ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                )}>
                  {product.stock > 10 ? "In Stock" : 
                   product.stock > 0 ? "Low Stock" : "Out of Stock"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Category: {product.category}
                  </span>
                </div>
                <div className="flex items-center">
                  <Truck className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Delivery: {product.deliveryRange}km
                  </span>
                </div>
              </div>

              {product.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm">{product.description}</p>
                </div>
              )}
            </div>

            {/* Order Button */}
            {user?.role === 'VENDOR' && (
              <button
                onClick={() => setShowOrderForm(true)}
                disabled={product.stock === 0}
                className={cn(
                  "w-full btn btn-primary flex items-center justify-center",
                  product.stock === 0 && "opacity-50 cursor-not-allowed"
                )}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.stock === 0 ? "Out of Stock" : "Place Order"}
              </button>
            )}
          </div>

          {/* Order Form & Price Trends */}
          <div className="space-y-6">
            {/* Order Form */}
            {showOrderForm && user?.role === 'VENDOR' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Place Order</h2>
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity ({product.unitType})
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="input w-full"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Available: {product.stock} {product.unitType}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Amount
                    </label>
                    <div className="text-2xl font-bold text-primary">
                      ₹{(product.unitPrice * quantity).toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {user.location?.address || 'Address not set'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      rows="3"
                      className="input w-full"
                      placeholder="Any special instructions..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowOrderForm(false)}
                      className="btn btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createOrderMutation.isPending}
                      className="btn btn-primary flex-1 flex items-center justify-center"
                    >
                      {createOrderMutation.isPending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Place Order
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Price Trends Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-5 h-5 text-primary mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Price Trends</h2>
              </div>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Historical price data helps you make informed decisions
                </p>
              </div>
            </div>

            {/* Supplier Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Supplier Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Delivery Range: {product.deliveryRange}km
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    Estimated Delivery: 2-3 business days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;