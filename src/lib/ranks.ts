// Shared rank constants and utilities for the whole project

export type RankValue =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Conqueror"
  | "Grandmaster"
  | "Great Grandmaster"
  | "Warlord"
  | "General"
  | "Great General"
  | "Commander"
  | "Warlord Supreme"
  | "Legendary";

export const RANK_LABELS: Record<RankValue, string> = {
  Bronze: "Đồng",
  Silver: "Bạc",
  Gold: "Vàng",
  Platinum: "Bạch kim",
  Diamond: "Kim cương",
  Conqueror: "Tinh Anh",
  Grandmaster: "Cao thủ",
  "Great Grandmaster": "Đại Cao Thủ",
  Warlord: "Danh Tướng",
  General: "Kiện Tướng",
  "Great General": "Đại Kiện Tướng",
  Commander: "Chiến Tướng",
  "Warlord Supreme": "Chiến Thần",
  Legendary: "Huyền Thoại",
};

export const RANK_VALUES: RankValue[] = Object.keys(RANK_LABELS) as RankValue[];

export const RANK_OPTIONS = RANK_VALUES.map((value) => ({
  value,
  label: RANK_LABELS[value],
}));

export function getRankLabel(value?: string | null): string {
  if (!value) return "Chưa xác định";
  return (RANK_LABELS as Record<string, string>)[value] || value;
}
