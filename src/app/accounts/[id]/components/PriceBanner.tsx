"use client";

import { Typography } from "antd";

type PriceBannerProps = {
  price: number;
};

export default function PriceBanner({ price }: PriceBannerProps) {
  return (
    <div className="relative mb-6 rounded-2xl overflow-hidden border border-amber-200/60 shadow-[0_10px_30px_rgba(245,158,11,0.25)]">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"></div>
      <div className="absolute -inset-x-20 -bottom-16 h-40 bg-white/20 blur-2xl"></div>
      <div className="relative z-10 text-center px-6 py-5">
        <div className="text-white/80 text-xs tracking-widest font-semibold mb-1">
          GIÁ BÁN
        </div>
        <Typography.Title
          level={2}
          className="!mb-0 text-white font-extrabold drop-shadow">
          {new Intl.NumberFormat("vi-VN").format(price)}₫
        </Typography.Title>
      </div>
    </div>
  );
}
