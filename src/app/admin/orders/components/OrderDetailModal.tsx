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
  Image,
  Button,
} from 'antd';
import { CopyOutlined, EyeOutlined } from '@ant-design/icons';
import { AdminOrder } from '../hooks/useAdminOrders';

const { Title, Text, Paragraph } = Typography;

interface OrderDetailModalProps {
  open: boolean;
  order: AdminOrder | null;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  getStatusText: (status: string) => string;
  getStatusColor: (status: string) => string;
  getPaymentMethodText: (method: string) => string;
}

export default function OrderDetailModal({
  open,
  order,
  onClose,
  formatCurrency,
  formatDate,
  getStatusText,
  getStatusColor,
  getPaymentMethodText,
}: OrderDetailModalProps) {
  if (!order) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const { account, user, payments } = order;
  const mainImage = account.images?.[0] || '/placeholder-account.jpg';

  return (
    <Modal
      title={`Chi tiết đơn hàng ${order.orderNumber}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      className="order-detail-modal"
    >
      <div className="space-y-6">
        {/* Order Information */}
        <Card title="Thông tin đơn hàng" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Mã đơn hàng">
              <Text code>{order.orderNumber}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Badge
                color={getStatusColor(order.status)}
                text={getStatusText(order.status)}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Giá trị">
              <Text strong className="text-green-600">
                {formatCurrency(order.amount)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức giao hàng">
              {order.deliveryMethod}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {formatDate(order.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật cuối">
              {formatDate(order.updatedAt)}
            </Descriptions.Item>
            {order.deliveredAt && (
              <Descriptions.Item label="Ngày giao hàng">
                {formatDate(order.deliveredAt)}
              </Descriptions.Item>
            )}
            {order.notes && (
              <Descriptions.Item label="Ghi chú" span={2}>
                <Paragraph className="!mb-0">{order.notes}</Paragraph>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Customer Information */}
        <Card title="Thông tin khách hàng" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Tên">
              {order.customerName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <Text copyable>{order.customerEmail}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tài khoản hệ thống">
              <Text code>{user.email}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Tag color={user.role === 'ADMIN' ? 'red' : 'blue'}>
                {user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Account Information */}
        <Card title="Thông tin tài khoản game" size="small">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div className="text-center">
                <Image
                  src={mainImage}
                  alt="Account preview"
                  width={150}
                  height={150}
                  className="rounded-lg object-cover"
                  fallback="/placeholder-account.jpg"
                />
              </div>
            </Col>
            <Col xs={24} md={16}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Rank">
                  <Tag color="blue">{account.rank || 'N/A'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Giá">
                  <Text strong className="text-green-600">
                    {formatCurrency(account.price)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số tướng">
                  {account.heroesCount}
                </Descriptions.Item>
                <Descriptions.Item label="Số skin">
                  {account.skinsCount}
                </Descriptions.Item>
                {account.level && (
                  <Descriptions.Item label="Cấp độ">
                    {account.level}
                  </Descriptions.Item>
                )}
                {account.winRate && (
                  <Descriptions.Item label="Tỷ lệ thắng">
                    {account.winRate.toFixed(1)}%
                  </Descriptions.Item>
                )}
                {account.matches && (
                  <Descriptions.Item label="Số trận đấu">
                    {account.matches}
                  </Descriptions.Item>
                )}
                {account.reputation && (
                  <Descriptions.Item label="Danh tiếng">
                    {account.reputation}
                  </Descriptions.Item>
                )}
                {account.loginMethod && (
                  <Descriptions.Item label="Phương thức đăng nhập">
                    {account.loginMethod}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Col>
          </Row>

          {account.description && (
            <div className="mt-4">
              <Text strong>Mô tả:</Text>
              <Paragraph className="!mb-0 mt-1">{account.description}</Paragraph>
            </div>
          )}

          {/* Account Credentials - Only show for completed orders */}
          {order.status === 'COMPLETED' && (account.gameUsername || account.gamePassword) && (
            <>
              <Divider />
              <div>
                <Title level={5} className="!mb-3">
                  Thông tin đăng nhập
                </Title>
                <Row gutter={[16, 16]}>
                  {account.gameUsername && (
                    <Col xs={24} md={12}>
                      <div>
                        <Text strong>Tên đăng nhập:</Text>
                        <div className="flex items-center gap-2 mt-1">
                          <Text code className="flex-1">
                            {account.gameUsername}
                          </Text>
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(account.gameUsername!)}
                          />
                        </div>
                      </div>
                    </Col>
                  )}
                  {account.gamePassword && (
                    <Col xs={24} md={12}>
                      <div>
                        <Text strong>Mật khẩu:</Text>
                        <div className="flex items-center gap-2 mt-1">
                          <Text code className="flex-1">
                            {account.gamePassword}
                          </Text>
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(account.gamePassword!)}
                          />
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>
                {account.additionalInfo && (
                  <div className="mt-4">
                    <Text strong>Thông tin bổ sung:</Text>
                    <Paragraph className="!mb-0 mt-1">
                      {account.additionalInfo}
                    </Paragraph>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>

        {/* Payment Information */}
        {payments && payments.length > 0 && (
          <Card title="Thông tin thanh toán" size="small">
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="border rounded p-3">
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={12}>
                      <Text strong>Phương thức: </Text>
                      <Text>{getPaymentMethodText(payment.method)}</Text>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Text strong>Trạng thái: </Text>
                      <Badge
                        color={payment.status === 'SUCCESS' ? 'green' : 'orange'}
                        text={payment.status === 'SUCCESS' ? 'Thành công' : 'Chờ xử lý'}
                      />
                    </Col>
                    <Col xs={24} sm={12}>
                      <Text strong>Số tiền: </Text>
                      <Text className="text-green-600">
                        {formatCurrency(payment.amount)}
                      </Text>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Text strong>Ngày thanh toán: </Text>
                      <Text>
                        {payment.paidAt ? formatDate(payment.paidAt) : 'Chưa thanh toán'}
                      </Text>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
}
