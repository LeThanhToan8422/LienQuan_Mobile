"use client";
// Hook: useAccountDetail
// Purpose
// - Orchestrates data fetching and presentation helpers for the account detail page
// - Exposes UI-friendly fields (rankDisplay, accountStats, characterSkins, images)
// - Keeps view components simple by hiding parsing and defensive checks
// Notes
// - Avoids throwing; all failures resolve to safe defaults (null/[]) so UI can render
// - Splits responsibilities: fetch → reveal animation flag → derive fields → styling helpers

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRankLabel } from "@/lib/ranks";

export type CharacterSkin = {
  character: string;
  skin: string;
  rarity: string;
  avatar: string;
  background: string;
};

export type Account = {
  id: string;
  rank: string | null;
  price: number;
  heroesCount: number;
  skinsCount: number;
  images: unknown;
  description: string | null;
  status: string;
  createdAt: string;
  level?: number;
  matches?: number;
  winRate?: number;
  reputation?: number;
  characterSkins?: CharacterSkin[];
};

export default function useAccountDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  // Page state: raw account payload, loading lifecycle, and a reveal flag
  const [acc, setAcc] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch the account by id. Intentionally resilient: on any error, treat as not found.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/accounts/${id}`);
        if (!res.ok) throw new Error("Not found");
        const json: Account = await res.json();
        if (mounted) setAcc(json);
      } catch {
        if (mounted) setAcc(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Flip the reveal flag once content is ready, enables entrance animation in the page.
  useEffect(() => {
    if (!loading && acc) {
      setIsVisible(true);
    }
  }, [loading, acc]);

  // Derived data helpers ------------------------------------------------------
  // Images are stored as an array in the API. Defensively coerce to string[].
  const images: string[] = Array.isArray(acc?.images)
    ? (acc?.images as string[])
    : [];

  // Character skins parsing (safe): the field may be already parsed or a JSON string.
  // If malformed, we silently fall back to an empty list to keep UI stable.
  let characterSkins: CharacterSkin[] = [];
  if (acc?.characterSkins) {
    try {
      const parsed = Array.isArray(acc.characterSkins)
        ? acc.characterSkins
        : (JSON.parse(
            acc.characterSkins as unknown as string
          ) as CharacterSkin[]);
      if (Array.isArray(parsed)) characterSkins = parsed;
    } catch {
      characterSkins = [];
    }
  }

  // Rank mapping and display name -------------------------------------------
  // Provide Vietnamese display names while preserving unknown values.
  const rankDisplay = getRankLabel(acc?.rank || undefined);

  // Account stats -------------------------------------------------------------
  // Normalize optional numeric fields to defined defaults for charts/badges.
  const accountStats = {
    level: acc?.level || "I",
    skins: acc?.skinsCount,
    heroes: acc?.heroesCount,
    matches: acc?.matches || 0,
    winRate: acc?.winRate || 0,
    reputation: acc?.reputation || 0,
  };

  // Rarity styling helper -----------------------------------------------------
  // Maps item rarity to gradient tokens used across avatar ring, label, glow.
  const getRarityClasses = (rarity?: string) => {
    const r = (rarity || "").toUpperCase();
    if (r.includes("SS+")) {
      return {
        ring: "ring-2 ring-pink-400 shadow-pink-400/50",
        badge: "from-pink-500 via-rose-500 to-orange-400",
        glow: "shadow-pink-400/30",
      };
    }
    if (r.startsWith("SSM") || r.includes("SSM")) {
      return {
        ring: "ring-2 ring-violet-400 shadow-violet-400/50",
        badge: "from-violet-500 via-purple-500 to-indigo-400",
        glow: "shadow-violet-400/30",
      };
    }
    if (r.includes("SS")) {
      return {
        ring: "ring-2 ring-purple-400 shadow-purple-400/50",
        badge: "from-purple-500 via-fuchsia-500 to-pink-400",
        glow: "shadow-purple-400/30",
      };
    }
    if (r.includes("S+")) {
      return {
        ring: "ring-2 ring-blue-400 shadow-blue-400/50",
        badge: "from-sky-500 via-blue-500 to-cyan-400",
        glow: "shadow-blue-400/30",
      };
    }
    if (r.startsWith("A")) {
      return {
        ring: "ring-2 ring-teal-400 shadow-teal-400/50",
        badge: "from-teal-500 via-emerald-500 to-green-400",
        glow: "shadow-teal-400/30",
      };
    }
    return {
      ring: "ring-2 ring-slate-300 shadow-slate-300/50",
      badge: "from-slate-400 via-gray-500 to-slate-500",
      glow: "shadow-slate-400/30",
    };
  };

  // Public API of the hook — keep naming ergonomic for components.
  return {
    id,
    acc,
    loading,
    router,
    isVisible,
    images,
    characterSkins,
    rankDisplay,
    accountStats,
    getRarityClasses,
  };
}
