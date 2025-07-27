import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'react-query';
import { ordersAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const SupplierAnalytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery(
    ['supplier-analytics', user?.id],
    () => ordersAPI.getAnalytics(user?.id),
    { enabled: !!user?.id }
  );

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-red-500">Failed to load analytics.</div>;

  const analytics = data?.data || {};

  return (
    <div className="max-w-3xl mx-auto py-8">
      <button className="mb-6 btn btn-outline" onClick={() => navigate('/dashboard')}>&larr; Back</button>
      <h2 className="text-2xl font-bold mb-6">Supplier Analytics</h2>
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="card p-4">
          <div className="text-gray-500">Total Orders (last 7 days)</div>
          <div className="text-2xl font-bold">{analytics.totalOrders || 0}</div>
        </div>
        <div className="card p-4">
          <div className="text-gray-500">Total Revenue (last 7 days)</div>
          <div className="text-2xl font-bold">₹{analytics.totalRevenue || 0}</div>
        </div>
        <div className="card p-4">
          <div className="text-gray-500">Pending Orders</div>
          <div className="text-2xl font-bold">{analytics.pendingOrders || 0}</div>
        </div>
        <div className="card p-4">
          <div className="text-gray-500">Completed Orders</div>
          <div className="text-2xl font-bold">{analytics.completedOrders || 0}</div>
        </div>
      </div>
      <div className="card p-4">
        <div className="font-semibold mb-2">Orders Per Day (last 7 days)</div>
        <pre className="text-sm bg-gray-50 p-2 rounded overflow-x-auto">{JSON.stringify(analytics.ordersPerDay, null, 2)}</pre>
      </div>
    </div>
  );
};

export default SupplierAnalytics;
