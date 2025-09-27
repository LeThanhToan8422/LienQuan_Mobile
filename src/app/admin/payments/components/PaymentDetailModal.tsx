'use client';

import {
  Modal,
  Descriptions,
  Tag,
  Badge,
  Row,
  Col,
  Card,
  Typography,
  Space,
  Divider,
} from 'antd';
interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  gatewayTransactionId: string | null;
  paidAt: Date | null;
  failureReason: string | null;
  refundedAt: Date | null;
  refundAmount: number | null;
  createdAt: Date;
  updatedAt: Date;
  order: {
    id: string;
    orderNumber: string;
    amount: number;
    status: string;
    customerName: string;
    customerEmail: string;
    createdAt: Date;
    account: {
      id: string;
      rank: string | null;
      price: number;
    };
  };
}

const { Title, Text, Paragraph } = Typography;

interface PaymentDetailModalProps {
  open: boolean;
  payment: Payment | null;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  getStatusText: (status: string) => string;
  getStatusColor: (status: string) => string;
  getPaymentMethodText: (method: string) => string;
}

export default function PaymentDetailModal({
  open,
  payment,
  onClose,
  formatCurrency,
  formatDate,
  getStatusText,
  getStatusColor,
  getPaymentMethodText,
}: PaymentDetailModalProps) {
  if (!payment) return null;

  const { order } = payment;

  return (
    <Modal
      title={`Chi tiết giao dịch ${payment.gatewayTransactionId || payment.id}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      className="payment-detail-modal"
    >
      <div className="space-y-6">
        {/* Payment Information */}
        <Card title="Thông tin giao dịch" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Mã giao dịch">
              <Text code>{payment.gatewayTransactionId || 'N/A'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Badge
                color={getStatusColor(payment.status)}
                text={getStatusText(payment.status)}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức">
              <Tag color="blue">{getPaymentMethodText(payment.method)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              <Text strong className="text-green-600">
                {formatCurrency(payment.amount)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {formatDate(payment.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật cuối">
              {formatDate(payment.updatedAt)}
            </Descriptions.Item>
            {payment.paidAt && (
              <Descriptions.Item label="Ngày thanh toán">
                {formatDate(payment.paidAt)}
              </Descriptions.Item>
            )}
            {payment.refundedAt && (
              <Descriptions.Item label="Ngày hoàn tiền">
                {formatDate(payment.refundedAt)}
              </Descriptions.Item>
            )}
            {payment.refundAmount && (
              <Descriptions.Item label="Số tiền hoàn">
                <Text className="text-red-600">
                  {formatCurrency(payment.refundAmount)}
                </Text>
              </Descriptions.Item>
            )}
            {payment.failureReason && (
              <Descriptions.Item label="Lý do thất bại" span={2}>
                <Paragraph className="!mb-0 text-red-600">
                  {payment.failureReason}
                </Paragraph>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Order Information */}
        <Card title="Thông tin đơn hàng" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Mã đơn hàng">
              <Text code>{order.orderNumber}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái đơn hàng">
              <Badge
                color={order.status === 'COMPLETED' ? 'green' : 'orange'}
                text={order.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang xử lý'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              {order.customerName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <Text copyable>{order.customerEmail}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Giá trị đơn hàng">
              <Text strong className="text-green-600">
                {formatCurrency(order.amount)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo đơn hàng">
              {formatDate(order.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Account Information */}
        <Card title="Thông tin tài khoản" size="small">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div>
                <Text strong>Rank:</Text>
                <div className="mt-1">
                  <Tag color="blue">{order.account.rank || 'N/A'}</Tag>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div>
                <Text strong>Giá tài khoản:</Text>
                <div className="mt-1">
                  <Text strong className="text-green-600">
                    {formatCurrency(order.account.price)}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </Modal>
  );
}
