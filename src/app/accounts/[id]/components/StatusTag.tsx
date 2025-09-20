"use client";

import { Tag, Tooltip } from "antd";

type StatusTagProps = {
  status: string;
};

export default function StatusTag({ status }: StatusTagProps) {
  const color =
    status === "available"
      ? "green"
      : status === "reserved"
      ? "orange"
      : "default";
  const text =
    status === "available"
      ? "✅ Có sẵn"
      : status === "reserved"
      ? "⏳ Đã đặt"
      : "❌ Không khả dụng";
  const tip =
    status === "available"
      ? "Có thể mua ngay"
      : status === "reserved"
      ? "Tài khoản đang được giữ chỗ"
      : "Chưa mở bán";
  return (
    <div className="text-center mt-4">
      <Tooltip title={tip}>
        <Tag
          color={color}
          className="text-sm px-4 py-2 rounded-full font-semibold shadow hover:shadow-md">
          {text}
        </Tag>
      </Tooltip>
      <div className="text-xs text-gray-500 mt-2">
        Thanh toán an toàn • Giao tài khoản nhanh
      </div>
    </div>
  );
}
