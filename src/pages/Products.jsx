import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Search, Filter, Plus, Star } from 'lucide-react'
import { productsAPI } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [locationKms, setLocationKms] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  const { data: products, isLoading, error } = useQuery(
    ['products', searchTerm, category, minPrice, maxPrice, locationKms, sortBy, currentPage],
    () => productsAPI.getAll({
      search: searchTerm,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      locationKms: locationKms ? parseFloat(locationKms) : undefined,
      sortBy: sortBy || undefined,
      page: currentPage,
      size: 12
    })
  )

  const categories = [
    'Vegetables',
    'Fruits',
    'Grains',
    'Spices',
    'Oils',
    'Dairy',
    'Meat',
    'Others'
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(0)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
    setLocationKms('')
    setSortBy('')
    setCurrentPage(0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-error-600">Error loading products: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse and search for raw materials from verified suppliers
          </p>
        </div>
        <button className="btn btn-primary mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Filters (left) */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="input"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="input"
              />
              <input
                type="number"
                placeholder="Location (kms)"
                value={locationKms}
                onChange={(e) => setLocationKms(e.target.value)}
                className="input"
              />
            </div>
            {/* Search (center) */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            {/* Sorting (right) */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-end md:items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input"
              >
                <option value="">Sort By</option>
                <option value="nearness">Sort by Nearness</option>
                <option value="delivery">Sort by Delivery Date</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <button type="submit" className="btn btn-primary">
                <Search className="h-4 w-4 mr-2" />
                Search
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-outline"
              >
                Clear Filters
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {products?.content?.map((product) => (
          <div key={product.id} className="card hover:shadow-medium transition-shadow min-h-[340px] flex flex-col justify-between text-base">
            <div>
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 text-xl">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                {product.description && (
                  <p className="text-base text-gray-700 mb-3 line-clamp-3">{product.description}</p>
                )}
                <div className="flex flex-wrap gap-3 mb-3">
                  {product.deliveryDays && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Delivery: {product.deliveryDays} day{product.deliveryDays > 1 ? 's' : ''}</span>
                  )}
                  {product.distanceKm && (
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">{product.distanceKm.toFixed(1)} km away</span>
                  )}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    ���{product.unitPrice}
                  </span>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-base text-gray-600 ml-1">
                      {product.rating || 0}
                    </span>
                  </div>
                </div>
                {product.supplierName && (
                  <div className="mb-2">
                    <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      By {product.supplierName}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Stock: {product.stock}</span>
                  <span>{product.unitType}</span>
                </div>
              </div>
            </div>
            <button className="w-full btn btn-primary rounded-b-lg text-lg py-3">
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {products?.content?.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Search className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Pagination */}
      {products && products.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {currentPage * 12 + 1} to {Math.min((currentPage + 1) * 12, products.totalElements)} of {products.totalElements} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="btn btn-outline disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= products.totalPages - 1}
              className="btn btn-outline disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products