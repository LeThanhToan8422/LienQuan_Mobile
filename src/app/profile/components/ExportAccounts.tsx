'use client';

import { useState } from 'react';
import { Order } from '../hooks/useProfile';

interface ExportAccountsProps {
  orders: Order[];
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
}

export default function ExportAccounts({ orders, formatCurrency, formatDate }: ExportAccountsProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Chỉ lấy đơn hàng đã hoàn thành (orders đã được filter từ API)
  const completedOrders = orders;

  const exportToText = () => {
    setIsExporting(true);
    
    let content = '=== THÔNG TIN TÀI KHOẢN ĐÃ MUA ===\n\n';
    content += `Ngày xuất: ${formatDate(new Date())}\n`;
    content += `Tổng số tài khoản: ${completedOrders.length}\n\n`;

    completedOrders.forEach((order, index) => {
      const { account } = order;
      content += `--- TÀI KHOẢN ${index + 1} ---\n`;
      content += `Số đơn hàng: ${order.orderNumber}\n`;
      content += `Ngày mua: ${formatDate(order.createdAt)}\n`;
      content += `Giá: ${formatCurrency(account.price)}\n`;
      content += `Rank: ${account.rank || 'N/A'}\n`;
      content += `Số tướng: ${account.heroesCount}\n`;
      content += `Số skin: ${account.skinsCount}\n`;
      
      if (account.gameUsername) {
        content += `Tên đăng nhập: ${account.gameUsername}\n`;
      }
      if (account.gamePassword) {
        content += `Mật khẩu: ${account.gamePassword}\n`;
      }
      if (account.loginMethod) {
        content += `Phương thức đăng nhập: ${account.loginMethod}\n`;
      }
      if (account.additionalInfo) {
        content += `Thông tin bổ sung: ${account.additionalInfo}\n`;
      }
      
      content += `Mô tả: ${account.description || 'N/A'}\n`;
      content += '\n';
    });

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tai-khoan-da-mua-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
  };

  const exportToJSON = () => {
    setIsExporting(true);
    
    const exportData = {
      exportDate: new Date().toISOString(),
      totalAccounts: completedOrders.length,
      accounts: completedOrders.map(order => ({
        orderNumber: order.orderNumber,
        purchaseDate: order.createdAt,
        price: order.amount,
        account: {
          rank: order.account.rank,
          heroesCount: order.account.heroesCount,
          skinsCount: order.account.skinsCount,
          level: order.account.level,
          winRate: order.account.winRate,
          matches: order.account.matches,
          reputation: order.account.reputation,
          gameUsername: order.account.gameUsername,
          loginMethod: order.account.loginMethod,
          additionalInfo: order.account.additionalInfo,
          description: order.account.description,
        }
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tai-khoan-da-mua-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
  };

  if (completedOrders.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Xuất thông tin tài khoản</h3>
          <p className="text-sm text-gray-600 mt-1">
            Xuất thông tin {completedOrders.length} tài khoản đã mua thành công
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToText}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Đang xuất...' : 'Xuất TXT'}
          </button>
          <button
            onClick={exportToJSON}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Đang xuất...' : 'Xuất JSON'}
          </button>
        </div>
      </div>
    </div>
  );
}
