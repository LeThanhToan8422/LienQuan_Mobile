"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, Result, Button, Spin, Typography } from "antd";
import Link from "next/link";

function VNPayReturnContent() {
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    message: string;
    orderNumber?: string;
  } | null>(null);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Simulate payment verification for now
        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
        const vnp_TxnRef = searchParams.get('vnp_TxnRef');
        
        // In real implementation, verify with backend
        if (vnp_ResponseCode === '00') {
          setPaymentResult({
            success: true,
            message: 'Thanh toán thành công',
            orderNumber: vnp_TxnRef || '',
          });
        } else {
          setPaymentResult({
            success: false,
            message: 'Thanh toán thất bại hoặc bị hủy',
          });
        }
      } catch {
        setPaymentResult({
          success: false,
          message: 'Có lỗi xảy ra khi xác thực thanh toán',
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Spin size="large" />
        <Typography.Title level={4} className="mt-4">
          Đang xử lý kết quả thanh toán...
        </Typography.Title>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <Result
          status={paymentResult?.success ? "success" : "error"}
          title={paymentResult?.success ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          subTitle={
            paymentResult?.success
              ? `Đơn hàng ${paymentResult.orderNumber || ''} đã được thanh toán thành công. Thông tin tài khoản game đã được gửi đến email của bạn.`
              : paymentResult?.message || "Có lỗi xảy ra trong quá trình thanh toán"
          }
          extra={[
            <Link href="/accounts" key="accounts">
              <Button type="primary">Xem thêm tài khoản</Button>
            </Link>,
            <Link href="/" key="home">
              <Button>Về trang chủ</Button>
            </Link>,
          ]}
        />
        
        {paymentResult?.success && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <Typography.Title level={5} className="text-green-800 mb-2">
              🎉 Chúc mừng bạn đã mua thành công!
            </Typography.Title>
            <Typography.Paragraph className="text-green-700 mb-0">
              • Thông tin tài khoản game đã được gửi đến email của bạn<br/>
              • Vui lòng kiểm tra hộp thư và thùng spam<br/>
              • Đổi mật khẩu ngay sau khi nhận tài khoản để bảo mật<br/>
              • Liên hệ hỗ trợ nếu có vấn đề: support@lqshop.com
            </Typography.Paragraph>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function VNPayReturnPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Spin size="large" />
        <Typography.Title level={4} className="mt-4">
          Đang tải...
        </Typography.Title>
      </div>
    }>
      <VNPayReturnContent />
    </Suspense>
  );
}