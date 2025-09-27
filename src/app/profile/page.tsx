'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useProfile from './hooks/useProfile';
import ProfileForm from './components/ProfileForm';
import StatsCards from './components/StatsCards';
import OrderFilters from './components/OrderFilters';
import AccountCard from './components/AccountCard';
import ExportAccounts from './components/ExportAccounts';
import EmptyState from './components/EmptyState';
import { Order } from './hooks/useProfile';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    profile,
    loading,
    error,
    updating,
    updateProfile,
    getOrderStatusText,
    getOrderStatusColor,
    getPaymentStatusText,
    getPaymentMethodText,
    formatCurrency,
    formatDate,
  } = useProfile();

  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (profile) {
      setFilteredOrders(profile.orders);
    }
  }, [profile]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy thông tin</h2>
          <p className="text-gray-600">Không thể tải thông tin người dùng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
          <p className="mt-2 text-gray-600">
            Quản lý thông tin cá nhân và xem lịch sử đơn hàng của bạn
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards 
          statistics={profile.statistics} 
          formatCurrency={formatCurrency} 
        />

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tài khoản đã mua ({profile.orders.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <ProfileForm
            profile={profile}
            onUpdate={updateProfile}
            updating={updating}
          />
        )}

        {activeTab === 'orders' && (
          <div>
            {/* Export Accounts */}
            <ExportAccounts
              orders={profile.orders}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />

            {/* Filters */}
            <OrderFilters
              orders={profile.orders}
              onFilteredOrders={setFilteredOrders}
              getOrderStatusText={getOrderStatusText}
            />

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <EmptyState
                title={profile.orders.length === 0 ? 'Chưa có tài khoản nào đã mua thành công' : 'Không tìm thấy tài khoản phù hợp'}
                description={profile.orders.length === 0 
                  ? 'Chỉ hiển thị các tài khoản đã thanh toán thành công. Hãy mua tài khoản đầu tiên của bạn!' 
                  : 'Thử thay đổi bộ lọc để tìm tài khoản khác'
                }
                showButton={profile.orders.length === 0}
                buttonText="Xem tài khoản có sẵn"
              />
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <AccountCard
                    key={order.id}
                    order={order}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getOrderStatusText={getOrderStatusText}
                    getOrderStatusColor={getOrderStatusColor}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
