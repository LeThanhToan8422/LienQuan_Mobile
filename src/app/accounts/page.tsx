"use client";

import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Select,
  Pagination,
  Empty,
  Space,
  Typography,
  Alert,
} from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useAccounts from "./hooks/useAccounts";
import { RANK_OPTIONS, getRankLabel } from "@/lib/ranks";
import Image from "next/image";

export default function AccountsPage() {
  const searchParams = useSearchParams();
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  
  const {
    form,
    data,
    total,
    page,
    pageSize,
    loading,
    setPage,
    setPageSize,
    onSearch,
  } = useAccounts();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "access-denied") {
      setShowAccessDenied(true);
      // Hide the alert after 5 seconds
      setTimeout(() => setShowAccessDenied(false), 5000);
    }
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Access Denied Alert */}
      {showAccessDenied && (
        <Alert
          type="warning"
          message="Truy cập bị từ chối"
          description="Bạn không có quyền truy cập vào trang quản trị. Chỉ có admin mới có thể truy cập."
          showIcon
          closable
          onClose={() => setShowAccessDenied(false)}
          className="mb-4"
        />
      )}
      {/* Search Form */}
      <Card className="shadow-lg border-0 rounded-2xl mb-8">
        <Form form={form} layout="vertical" onFinish={onSearch}>
          <Row gutter={[12, 8]} align="bottom" className="items-end">
            <Col xs={24} sm={12} md={6} lg={5}>
              <Form.Item name="q" label="Từ khóa" className="!mb-0">
                <Input placeholder="Mô tả, từ khóa..." size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item name="rank" label="Rank" className="!mb-0">
                <Select
                  allowClear
                  placeholder="Chọn rank"
                  size="large"
                  options={RANK_OPTIONS}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={6}>
              <Form.Item label="Giá" className="!mb-0">
                <Space.Compact className="!w-full">
                  <Form.Item name="minPrice" noStyle>
                    <InputNumber
                      className="!w-full"
                      min={0}
                      placeholder="Từ"
                      size="large"
                      formatter={(v) =>
                        `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(v?: string) =>
                        v ? Number(v.replace(/,/g, "")) : 0
                      }
                      addonAfter="₫"
                    />
                  </Form.Item>
                  <Form.Item name="maxPrice" noStyle>
                    <InputNumber
                      className="!w-full"
                      min={0}
                      placeholder="Đến"
                      size="large"
                      formatter={(v) =>
                        `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(v?: string) =>
                        v ? Number(v.replace(/,/g, "")) : 0
                      }
                      addonAfter="₫"
                    />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={3}>
              <Form.Item name="minHeroes" label="Tướng ≥" className="!mb-0">
                <InputNumber
                  className="!w-full"
                  min={0}
                  placeholder="0"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={3}>
              <Form.Item name="minSkins" label="Skin ≥" className="!mb-0">
                <InputNumber
                  className="!w-full"
                  min={0}
                  placeholder="0"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={3} className="flex items-end">
              <Space size="middle" className="w-full">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  className="flex-1">
                  Lọc
                </Button>
                <Button
                  onClick={() => {
                    form.resetFields();
                    onSearch();
                  }}
                  size="large"
                  className="flex-1">
                  Xóa
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <div className="mt-8">
        {data?.length === 0 ? (
          <Card className="shadow-lg border-0 rounded-2xl">
            <Empty
              description="Không tìm thấy tài khoản nào phù hợp"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {data?.map((acc, index) => {
              const images: string[] = Array.isArray(acc.images)
                ? (acc.images as string[])
                : [];
              const cover = images[0];

              // Compute badge colors by status
              const status = (acc.status || "available").toLowerCase();
              const statusStyles =
                status === "sold"
                  ? "bg-gray-500 text-white"
                  : status === "reserved"
                  ? "bg-amber-500 text-white"
                  : "bg-emerald-500 text-white";

              // Determine VIP by SSS rarity in characterSkins
              type CharacterSkinLite = { rarity?: string };
              let isVip = false;
              try {
                const raw: unknown = (
                  acc as unknown as { characterSkins?: unknown }
                ).characterSkins;
                const parsed: unknown = Array.isArray(raw)
                  ? raw
                  : raw
                  ? JSON.parse(
                      typeof raw === "string" ? raw : JSON.stringify(raw)
                    )
                  : [];
                const skinsArray = (parsed as CharacterSkinLite[]) || [];
                isVip = skinsArray.some((s) =>
                  String(s?.rarity || "")
                    .toUpperCase()
                    .includes("SSS")
                );
              } catch {
                isVip = false;
              }

              return (
                <Col key={acc.id} xs={24} sm={12} lg={8} xl={6}>
                  {/* Gradient frame wrapper for extra pop */}
                  <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-amber-400/50 via-transparent to-blue-500/50 hover:scale-[1.02] hover:-translate-y-2 transition-transform duration-500">
                    <div className="pointer-events-none absolute -inset-2 rounded-[26px] bg-gradient-to-br from-amber-400/20 via-fuchsia-400/10 to-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    {/* Enhanced Card with Advanced Animations */}
                    <div
                      className="group bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 ease-out hover:shadow-2xl transform-gpu border border-black/5"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: "fadeInUp 0.6s ease-out forwards",
                      }}>
                      {/* Top Section - Image with Zoom Effect */}
                      <div className="relative h-64 overflow-hidden bg-gray-100">
                        {cover ? (
                          <Image
                            src={cover}
                            alt={acc.rank || "acc"}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 transition-colors duration-300 group-hover:text-gray-600">
                            <Typography.Text>Không có ảnh</Typography.Text>
                          </div>
                        )}
                        {/* Overlay gradient to ensure text contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {/* Rank badge */}
                        <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md text-xs font-semibold bg-white/80 text-blue-700 shadow">
                          {getRankLabel(acc.rank)}
                        </div>
                        {/* VIP badge - any skin has rarity SSS */}
                        {isVip && (
                          <div className="absolute top-3 left-24 z-10 px-2 py-0.5 rounded-md text-xs font-bold bg-yellow-400 text-white shadow">
                            👑 VIP
                          </div>
                        )}
                        {/* Status ribbon */}
                        <div
                          className={`absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md text-xs font-bold shadow ${statusStyles}`}>
                          {status === "sold"
                            ? "Đã bán"
                            : status === "reserved"
                            ? "Giữ chỗ"
                            : "Có sẵn"}
                        </div>

                        {/* Floating price tag on image */}
                        <div className="absolute bottom-3 left-3 z-10 rounded-xl px-3 py-1.5 backdrop-blur-md bg-white/20 text-white shadow-lg ring-1 ring-white/30 animate-pulse">
                          <span className="text-lg font-extrabold drop-shadow-sm tracking-tight">
                            {new Intl.NumberFormat("vi-VN").format(acc.price)}₫
                          </span>
                        </div>
                      </div>

                      {/* Bottom Section - White Background with Slide Animation */}
                      <div className="p-4 bg-white relative overflow-hidden">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent"></div>

                        {/* Account Title with Typing Effect */}
                        <Typography.Paragraph
                          ellipsis={{ rows: 2, tooltip: true }}
                          className="!mb-1 text-gray-800 font-medium text-sm transition-colors duration-300 group-hover:text-gray-900">
                          Acc #{acc.id} -{" "}
                          {acc.description || "Tài khoản game chất lượng cao"}
                        </Typography.Paragraph>

                        {/* Rank with Pulse Animation */}
                        <Typography.Text className="text-gray-600 text-sm block mb-2 transition-colors duration-300 group-hover:text-gray-700">
                          Rank:{" "}
                          <span className="font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                            {getRankLabel(acc.rank)}
                          </span>
                        </Typography.Text>

                        {/* Stats with Stagger Animation → colorful chips */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500/15 to-fuchsia-500/15 text-purple-700 ring-1 ring-purple-400/30">
                            ✨ Trang phục: {acc.skinsCount}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500/15 to-green-500/15 text-emerald-700 ring-1 ring-emerald-400/30">
                            🛡️ Tướng: {acc.heroesCount}
                          </span>
                        </div>

                        {/* Enhanced Buttons - Side by Side Layout */}
                        <div className="flex gap-2">
                          {/* View Details Button */}
                          <Button
                            className="flex-1 rounded-lg shadow-md transition-all duration-300 ease-out group-hover:shadow-lg group-hover:scale-105 group-hover:-translate-y-1 relative overflow-hidden border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                            style={{
                              height: "40px",
                              background: "transparent",
                            }}
                            icon={
                              <span className="text-blue-600 transition-transform duration-300 group-hover:scale-110">
                                👁️
                              </span>
                            }
                            onClick={() => {
                              // Navigate to account detail page
                              window.location.href = `/accounts/${acc.id}`;
                            }}>
                            <span className="relative z-10 transition-all duration-300 group-hover:text-blue-700 text-xs">
                              Chi tiết
                            </span>
                            {/* Button Shine Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-blue-100/50 to-transparent"></div>
                          </Button>

                          {/* Buy Now Button */}
                          <Button
                            type="primary"
                            className="flex-1 rounded-lg shadow-md transition-all duration-300 ease-out group-hover:shadow-xl group-hover:scale-105 group-hover:-translate-y-1 relative overflow-hidden"
                            style={{
                              background:
                                "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
                              border: "none",
                              height: "40px",
                            }}
                            icon={
                              <span className="text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                🛒
                              </span>
                            }>
                            <span className="relative z-10 transition-all duration-300 group-hover:text-white text-xs">
                              Mua ngay
                            </span>
                            {/* Button Shine Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
      {/* Pagination */}
      <div className="flex justify-center mt-12">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} của ${total} tài khoản`
          }
          onChange={(p, ps) => {
            setPage(p);
            setPageSize(ps);
          }}
        />
      </div>

      {/* Custom CSS for Keyframe Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .group:hover .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
}
