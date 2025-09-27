'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Order } from '../hooks/useProfile';

interface AccountCardProps {
  order: Order;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  getOrderStatusText: (status: string) => string;
  getOrderStatusColor: (status: string) => string;
}

export default function AccountCard({ 
  order, 
  formatCurrency, 
  formatDate, 
  getOrderStatusText, 
  getOrderStatusColor 
}: AccountCardProps) {
  const [showCredentials, setShowCredentials] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const { account } = order;
  const mainImage = account.images?.[0] || '/placeholder-account.jpg';

  const toggleCredentials = () => {
    setShowCredentials(!showCredentials);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Đơn hàng #{order.orderNumber}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
            {getOrderStatusText(order.status)}
          </span>
        </div>
      </div>

      {/* Account Info */}
      <div className="p-4">
        <div className="flex gap-4">
          {/* Account Image */}
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden">
              <Image
                src={mainImage}
                alt="Account preview"
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-account.jpg';
                }}
              />
            </div>
          </div>

          {/* Account Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {account.rank && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {account.rank}
                </span>
              )}
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(account.price)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <span className="font-medium">Tướng:</span>
                <span>{account.heroesCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">Skin:</span>
                <span>{account.skinsCount}</span>
              </div>
              {account.level && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Cấp độ:</span>
                  <span>{account.level}</span>
                </div>
              )}
              {account.winRate && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Tỷ lệ thắng:</span>
                  <span>{account.winRate.toFixed(1)}%</span>
                </div>
              )}
            </div>

            {account.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {account.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={toggleDetails}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
          </button>
          
          {order.status === 'COMPLETED' && (
            <button
              onClick={toggleCredentials}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              {showCredentials ? 'Ẩn thông tin' : 'Xem thông tin đăng nhập'}
            </button>
          )}
        </div>

        {/* Detailed Information */}
        {showDetails && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Chi tiết tài khoản</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Số trận đấu:</span>
                <span className="ml-2">{account.matches || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Danh tiếng:</span>
                <span className="ml-2">{account.reputation || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Phương thức đăng nhập:</span>
                <span className="ml-2">{account.loginMethod || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Ngày tạo tài khoản:</span>
                <span className="ml-2">{formatDate(account.createdAt)}</span>
              </div>
            </div>

            {account.additionalInfo && (
              <div className="mt-3">
                <span className="font-medium text-gray-600">Thông tin bổ sung:</span>
                <p className="mt-1 text-sm text-gray-700">{account.additionalInfo}</p>
              </div>
            )}
          </div>
        )}

        {/* Account Credentials */}
        {showCredentials && order.status === 'COMPLETED' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-3">Thông tin đăng nhập</h4>
            
            <div className="space-y-3">
              {account.gameUsername && (
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Tên đăng nhập:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={account.gameUsername}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm bg-white border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(account.gameUsername!)}
                      className="px-3 py-2 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {account.gamePassword && (
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Mật khẩu:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={account.gamePassword}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm bg-white border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(account.gamePassword!)}
                      className="px-3 py-2 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {account.loginMethod && (
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Phương thức đăng nhập:
                  </label>
                  <p className="text-sm text-green-800">{account.loginMethod}</p>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs text-yellow-800">
                <strong>Lưu ý:</strong> Vui lòng lưu thông tin này ở nơi an toàn. 
                Thông tin đăng nhập chỉ hiển thị một lần và không thể khôi phục.
              </p>
            </div>
          </div>
        )}

        {/* Payment Information */}
        {order.payments && order.payments.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Thông tin thanh toán</h5>
            {order.payments.map((payment) => (
              <div key={payment.id} className="text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Phương thức: {payment.method}</span>
                  <span>Trạng thái: {payment.status}</span>
                </div>
                {payment.paidAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    Thanh toán lúc: {formatDate(payment.paidAt)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
