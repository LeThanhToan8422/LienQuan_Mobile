"use client";

import { Button, Modal, App, Spin } from "antd";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  accountId?: string;
  price?: number;
  onClick?: () => void;
};

type FormValues = {
  customerName: string;
  customerEmail: string;
};

export default function PurchaseButton({ accountId, price, onClick }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const { message } = App.useApp();
  const [checkingPending, setCheckingPending] = useState(false);
  const handlePurchase = () => {
    if (!session) {
      message.warning('Vui lòng đăng nhập để mua tài khoản');
      router.push('/auth/login');
      return;
    }
    
    if (onClick) {
      onClick();
    } else {
      setIsModalOpen(true);
      // Try to reuse pending order automatically; show spinner to avoid form flash
      if (accountId && price) {
        setCheckingPending(true);
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId, customerName: session.user?.name || '', customerEmail: session.user?.email || '' }),
        })
          .then(async (res) => res.json())
          .then((data: { success: boolean; sepay?: { qrUrl: string } }) => {
            if (data?.success && data.sepay?.qrUrl) {
              setQrUrl(data.sepay.qrUrl);
            }
          })
          .catch(() => {})
          .finally(() => setCheckingPending(false));
      }
    }
  };

  const handleSubmit = async (_values: FormValues) => {};

  const [qrUrl, setQrUrl] = useState<string | null>(null);

  return (
    <>
      <Button
        type="primary"
        size="large"
        className="w-full h-14 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] relative overflow-hidden group"
        style={{
          background:
            "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)",
          border: "none",
          boxShadow: "0 10px 25px rgba(245, 158, 11, 0.3)",
        }}
        icon={
          <span className="text-xl group-hover:scale-110 transition-transform duration-300">
            🛒
          </span>
        }
        onClick={handlePurchase}>
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span className="relative z-10 drop-shadow-sm">Mua ngay</span>
      </Button>

      <Modal
        title="Thông tin thanh toán"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={500}
      >
        {checkingPending && (
          <div className="mt-6 flex items-center justify-center">
            <Spin />
          </div>
        )}
        {!checkingPending && !qrUrl && (
          <div className="mt-6">
            {price && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tổng thanh toán:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {new Intl.NumberFormat('vi-VN').format(price)}₫
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-center text-gray-600">
              Đang chuẩn bị mã QR...
            </div>
            <div className="mt-4">
              <Button onClick={() => setIsModalOpen(false)} className="w-full">Đóng</Button>
            </div>
          </div>
        )}
        {!checkingPending && qrUrl && (
          <div className="mt-2">
            <p className="mb-2">Vui lòng quét mã QR để thanh toán. Đơn hàng sẽ tự động xác nhận sau khi nhận được giao dịch.</p>
            <div className="flex justify-center">
              <img src={qrUrl} alt="SePay QR" className="rounded-lg border" />
            </div>
            <div className="mt-4">
              <Button onClick={() => { setQrUrl(null); setIsModalOpen(false); }} className="w-full">Đóng</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
