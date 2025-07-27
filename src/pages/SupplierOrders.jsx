import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'react-query';
import { ordersAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const SupplierOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery(
    ['orders', 'supplier', user?.id],
    () => ordersAPI.getAll({ supplierId: user?.id, page: 0, size: 50 }),
    { enabled: !!user?.id }
  );

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-red-500">Failed to load orders.</div>;

  const orders = Array.isArray(data?.data?.orders)
    ? data.data.orders
    : data?.data?.content || [];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <button className="mb-6 btn btn-outline" onClick={() => navigate('/dashboard')}>&larr; Back</button>
      <h2 className="text-2xl font-bold mb-6">Orders Received</h2>
      {orders.length === 0 ? (
        <div className="text-gray-500">No orders received yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card p-4 flex flex-col">
              <div className="font-semibold">Order #{order.id.slice(-6)}</div>
              <div>Product: {order.productName}</div>
              <div>Quantity: {order.quantity}</div>
              <div>Total: ₹{order.totalAmount}</div>
              <div>Status: <span className="capitalize">{order.status}</span></div>
              <div>Vendor: {order.vendorId}</div>
              <div>Date: {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierOrders;
