"use client";

import { Tag } from "antd";

type InfoChipsProps = {
  skinsCount: number;
  heroesCount: number;
  rankDisplay: string;
  createdAt: string;
};

export default function InfoChips({
  skinsCount,
  heroesCount,
  rankDisplay,
  createdAt,
}: InfoChipsProps) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between rounded-xl border border-purple-200/60 bg-gradient-to-br from-purple-50 to-rose-50 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <span>👗</span>
            <span>Trang phục</span>
          </div>
          <div className="text-purple-600 font-bold text-lg">{skinsCount}</div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <span>⚔️</span>
            <span>Tướng</span>
          </div>
          <div className="text-emerald-600 font-bold text-lg">
            {heroesCount}
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50 to-sky-50 px-4 py-3 shadow-sm col-span-2">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <span>🏆</span>
            <span>Rank</span>
          </div>
          <Tag color="blue" className="font-bold px-3 py-1 rounded-full shadow">
            {rankDisplay}
          </Tag>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-gray-200/60 bg-gradient-to-br from-gray-50 to-slate-50 px-4 py-3 shadow-sm col-span-2">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <span>🗓️</span>
            <span>Đăng lúc</span>
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {new Date(createdAt).toLocaleString("vi-VN")}
          </div>
        </div>
      </div>
    </div>
  );
}
