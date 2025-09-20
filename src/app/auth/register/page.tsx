"use client";

import { Alert, Button, Card, Form, Input, Typography, Divider } from "antd";
import Link from "next/link";
import useRegister from "./hooks/useRegister";

export default function RegisterPage() {
  const { loading, error, ok, onFinish } = useRegister();

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Card className="shadow-lg">
        <Typography.Title level={3} className="!mb-2 text-center">
          Đăng ký tài khoản
        </Typography.Title>
        <Typography.Paragraph className="!mb-6 text-center" type="secondary">
          Tạo tài khoản để mua bán account Liên Quân Mobile
        </Typography.Paragraph>
        
        {error && <Alert type="error" message={error} className="!mb-4" />}
        {ok && (
          <Alert
            type="success"
            message="Đăng ký thành công!"
            description="Đang chuyển hướng đến trang đăng nhập..."
            className="!mb-4"
          />
        )}
        
        <Form layout="vertical" onFinish={onFinish} disabled={ok}>
          <Form.Item
            name="name"
            label="Tên hiển thị"
            rules={[
              { required: true, message: "Vui lòng nhập tên hiển thị" },
              { min: 2, message: "Tên phải có ít nhất 2 ký tự" },
              { max: 50, message: "Tên không được quá 50 ký tự" },
            ]}>
            <Input placeholder="Nhập tên hiển thị của bạn" size="large" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}>
            <Input placeholder="your.email@example.com" size="large" />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
                message: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
              },
            ]}
            hasFeedback>
            <Input.Password placeholder="Nhập mật khẩu mạnh" size="large" />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                },
              }),
            ]}
            hasFeedback>
            <Input.Password placeholder="Nhập lại mật khẩu" size="large" />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={loading}
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </Form.Item>
        </Form>
        
        <Divider>Hoặc</Divider>
        
        <div className="text-center">
          <Typography.Text type="secondary">
            Đã có tài khoản?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700">
              Đăng nhập ngay
            </Link>
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
}
