'use client';

import { useState, useEffect } from 'react';
import { UserProfile, UpdateProfileData } from '../hooks/useProfile';

interface ProfileFormProps {
  profile: UserProfile;
  onUpdate: (data: UpdateProfileData) => Promise<{ success: boolean; message?: string; error?: string }>;
  updating: boolean;
}

export default function ProfileForm({ profile, onUpdate, updating }: ProfileFormProps) {
  const [formData, setFormData] = useState<UpdateProfileData>({
    name: profile.name || '',
    email: profile.email,
  });
  const [errors, setErrors] = useState<Partial<UpdateProfileData>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      name: profile.name || '',
      email: profile.email,
    });
  }, [profile]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateProfileData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên không được để trống';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Tên không được quá 100 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    const result = await onUpdate(formData);
    
    if (result.success) {
      setMessage(result.message || 'Cập nhật thông tin thành công');
    } else {
      setMessage(result.error || 'Có lỗi xảy ra khi cập nhật');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof UpdateProfileData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Thông tin cá nhân</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('thành công') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Họ và tên *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Nhập họ và tên của bạn"
            disabled={updating}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Nhập email của bạn"
            disabled={updating}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
              {profile.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái xác thực
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
              {profile.emailVerifiedAt ? 'Đã xác thực' : 'Chưa xác thực'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày tạo tài khoản
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
              {new Intl.DateTimeFormat('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(profile.createdAt))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cập nhật lần cuối
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
              {new Intl.DateTimeFormat('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(profile.updatedAt))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updating}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updating ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
          </button>
        </div>
      </form>
    </div>
  );
}
