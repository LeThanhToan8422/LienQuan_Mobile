"use client";

import { Card, Typography, Button, Row, Col } from "antd";
// Account detail page for a single listing:
// - Reads data via useAccountDetail hook (server data + derived displays)
// - Provides progressive UI: loading skeleton → not-found → full detail
// - Two-column layout: left (stats, skins, gallery), right (price + meta)
// - Keeps visual polish but avoids local state where not needed
import useAccountDetail from "./hooks/useAccountDetail";
import PriceBanner from "./components/PriceBanner";
import InfoChips from "./components/InfoChips";
import ImageGallery from "./components/ImageGallery";
import StatusTag from "./components/StatusTag";
import StatsHeader from "./components/StatsHeader";
import CharacterGrid from "./components/CharacterGrid";
import PurchaseButton from "./components/PurchaseButton";

// Renders the detail view of an account. Split into clear states
// to ensure fast first paint and predictable user navigation.
export default function AccountDetailPage() {
  const {
    acc,
    loading,
    router,
    isVisible,
    images,
    characterSkins,
    rankDisplay,
    accountStats,
    getRarityClasses,
  } = useAccountDetail();
  // No local hover state needed after componentization

  // Loading: lightweight shimmering blocks instead of full layout
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-32 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl"></div>
              <div className="h-64 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl"></div>
            </div>
            <div className="h-96 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Not-found: graceful fallback with a direct way back to listing
  if (!acc) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <Card>
          <Typography.Title level={4} className="!mb-2">
            Không tìm thấy tài khoản
          </Typography.Title>
          <Button onClick={() => router.push("/accounts")}>
            Quay lại danh sách
          </Button>
        </Card>
      </div>
    );
  }

  // Main content: rely on global background; container keeps consistent gutters
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 min-h-screen">
      <div
        className={`transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
        <Row gutter={[16, 24]} className="!mx-0">
          {/* Left Panel — primary content: stats + skins + gallery */}
          <Col xs={24} lg={14} className="!px-0">
            <Card className="shadow-2xl border-0 rounded-3xl backdrop-blur-sm bg-white/80 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
              <StatsHeader stats={accountStats} />

              {/* Character Grid — guard against empty datasets */}
              {characterSkins.length > 0 && (
                <div className="mb-8">
                  <Typography.Title
                    level={4}
                    className="!mb-6 text-gray-800 font-bold text-xl">
                    Tướng & Trang phục
                  </Typography.Title>
                  <CharacterGrid
                    items={characterSkins}
                    getRarityClasses={getRarityClasses}
                  />
                </div>
              )}

              <ImageGallery images={images} />
            </Card>
          </Col>

          {/* Right Panel — purchase intent + metadata kept sticky for conversion */}
          <Col xs={24} lg={10} className="!px-0">
            <Card className="shadow-2xl border-0 rounded-3xl sticky top-4 backdrop-blur-sm bg-white/90 hover:shadow-3xl transition-all duration-500">
              <PriceBanner price={acc.price} />

              <InfoChips
                skinsCount={acc.skinsCount}
                heroesCount={acc.heroesCount}
                rankDisplay={rankDisplay}
                createdAt={acc.createdAt}
              />

              {/* Description — short marketing blurb / seller note */}
              <div className="mb-8">
                <Typography.Paragraph className="text-sm text-gray-600 bg-gradient-to-r from-gray-50 via-slate-50 to-zinc-50 p-4 rounded-xl border border-gray-200/60 shadow-sm">
                  {acc.description ||
                    "MUA ACC LIÊN QUÂN GIÁ RẺ, NHIỀU SKIN S+, SS, SSHH. TỰ ĐỘNG | AN TOÀN | BẢO MẬT | UY TÍN"}
                </Typography.Paragraph>
              </div>

              {/* Primary CTA */}
              <PurchaseButton accountId={acc.id} price={acc.price} />

              <StatusTag status={acc.status} />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
