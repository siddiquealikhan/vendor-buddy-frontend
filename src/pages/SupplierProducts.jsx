import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'react-query';
import { productsAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const SupplierProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery(
    ['products', 'supplier', user?.id],
    () => productsAPI.getBySupplier(user?.id),
    { enabled: !!user?.id }
  );

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-red-500">Failed to load products.</div>;

  const products = Array.isArray(data?.data)
    ? data.data
    : data?.data?.products || [];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <button className="mb-6 btn btn-outline" onClick={() => navigate('/dashboard')}>&larr; Back</button>
      <h2 className="text-2xl font-bold mb-6">My Products</h2>
      {products.length === 0 ? (
        <div className="text-gray-500">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map(product => (
            <div key={product.id} className="card p-4 flex flex-col">
              <img src={product.imageUrl} alt={product.name} className="h-40 object-cover rounded mb-2" />
              <div className="font-semibold text-lg">{product.name}</div>
              <div className="text-gray-500">Category: {product.category}</div>
              <div className="text-gray-500">Price: ₹{product.unitPrice}</div>
              <div className="text-gray-500">Stock: {product.stock}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierProducts;
