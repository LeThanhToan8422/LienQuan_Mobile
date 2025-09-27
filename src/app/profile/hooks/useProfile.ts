import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  emailVerifiedAt: Date | null;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  statistics: {
    totalOrders: number;
    completedOrders: number;
    totalSpent: number;
    pendingOrders: number;
    cancelledOrders: number;
  };
  orders: Order[];
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  accountId: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  customerEmail: string;
  customerName: string;
  deliveredAt: Date | null;
  deliveryMethod: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  account: {
    id: string;
    rank: string | null;
    price: number;
    heroesCount: number;
    skinsCount: number;
    description: string | null;
    images: string[];
    level: number | null;
    matches: number | null;
    winRate: number | null;
    reputation: number | null;
    characterSkins: any;
    gameUsername: string | null;
    gamePassword: string | null;
    loginMethod: string | null;
    additionalInfo: string | null;
    createdAt: Date;
  };
  payments: {
    id: string;
    amount: number;
    method: string;
    status: string;
    paidAt: Date | null;
    createdAt: Date;
  }[];
}

export interface UpdateProfileData {
  name: string;
  email: string;
}

export default function useProfile() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    if (status !== 'authenticated') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tải thông tin');
      }
      
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    setUpdating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Có lỗi xảy ra khi cập nhật');
      }
      
      // Refresh profile data
      await fetchProfile();
      
      return { success: true, message: result.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUpdating(false);
    }
  };

  const getOrderStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ thanh toán',
      'PROCESSING': 'Đang xử lý',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
      'REFUNDED': 'Đã hoàn tiền',
    };
    return statusMap[status] || status;
  };

  const getOrderStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'PENDING': 'text-yellow-600 bg-yellow-100',
      'PROCESSING': 'text-blue-600 bg-blue-100',
      'COMPLETED': 'text-green-600 bg-green-100',
      'CANCELLED': 'text-red-600 bg-red-100',
      'REFUNDED': 'text-gray-600 bg-gray-100',
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  };

  const getPaymentStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ thanh toán',
      'SUCCESS': 'Thành công',
      'FAILED': 'Thất bại',
      'CANCELLED': 'Đã hủy',
      'REFUNDED': 'Đã hoàn tiền',
    };
    return statusMap[status] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const methodMap: Record<string, string> = {
      'VNPAY': 'VNPay',
      'ZALOPAY': 'ZaloPay',
      'BANK': 'Chuyển khoản ngân hàng',
      'MOMO': 'Ví MoMo',
    };
    return methodMap[method] || method;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  return {
    profile,
    loading,
    error,
    updating,
    fetchProfile,
    updateProfile,
    getOrderStatusText,
    getOrderStatusColor,
    getPaymentStatusText,
    getPaymentMethodText,
    formatCurrency,
    formatDate,
  };
}
