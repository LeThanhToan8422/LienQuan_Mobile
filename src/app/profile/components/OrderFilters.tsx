'use client';

import { useState, useEffect } from 'react';
import { Order } from '../hooks/useProfile';

interface OrderFiltersProps {
  orders: Order[];
  onFilteredOrders: (orders: Order[]) => void;
  getOrderStatusText: (status: string) => string;
}

export default function OrderFilters({ orders, onFilteredOrders, getOrderStatusText }: OrderFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  const statusOptions = [
    { value: 'ALL', label: 'Tất cả tài khoản' },
    { value: 'COMPLETED', label: 'Đã mua thành công' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'price-high', label: 'Giá cao nhất' },
    { value: 'price-low', label: 'Giá thấp nhất' },
    { value: 'status', label: 'Theo trạng thái' },
  ];

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(term) ||
        order.account.rank?.toLowerCase().includes(term) ||
        order.account.description?.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerEmail.toLowerCase().includes(term)
      );
    }

    // Status filter (tất cả đều là COMPLETED nên không cần filter)
    // if (statusFilter !== 'ALL') {
    //   filtered = filtered.filter(order => order.status === statusFilter);
    // }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price-high':
        filtered.sort((a, b) => b.account.price - a.account.price);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.account.price - b.account.price);
        break;
      case 'status':
        filtered.sort((a, b) => a.status.localeCompare(b.status));
        break;
    }

    onFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setSortBy('newest');
    onFilteredOrders(orders);
  };

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, sortBy, orders]);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Lọc và tìm kiếm tài khoản</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              applyFilters();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Số đơn hàng, rank, mô tả..."
          />
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              applyFilters();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
            Sắp xếp
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              applyFilters();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Button */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="mt-4 text-sm text-gray-600">
        Hiển thị {orders.length} tài khoản đã mua thành công
      </div>
    </div>
  );
}
