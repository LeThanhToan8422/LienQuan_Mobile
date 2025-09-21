"use client";

import { useSession } from "next-auth/react";
import { Spin } from "antd";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  // Show loading while session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // If we reach here, middleware has already verified admin access
  // Just render the children
  return <>{children}</>;
}
