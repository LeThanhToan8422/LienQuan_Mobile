'use client';

import { UserProfile } from '../hooks/useProfile';

interface StatsCardsProps {
  statistics: UserProfile['statistics'];
  formatCurrency: (amount: number) => string;
}

export default function StatsCards({ statistics, formatCurrency }: StatsCardsProps) {
  const stats = [
    {
      title: 'Tổng đơn hàng',
      value: statistics.totalOrders,
      icon: '📦',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Đơn hàng hoàn thành',
      value: statistics.completedOrders,
      icon: '✅',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Tổng chi tiêu',
      value: formatCurrency(statistics.totalSpent),
      icon: '💰',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Đơn hàng chờ xử lý',
      value: statistics.pendingOrders,
      icon: '⏳',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Đơn hàng đã hủy',
      value: statistics.cancelledOrders,
      icon: '❌',
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center text-white text-xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
