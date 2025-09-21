"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spin, Alert } from "antd";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      // Not authenticated, redirect to login
      router.push("/auth/login?callbackUrl=/admin");
      return;
    }

    const user = session.user as { role?: string } | undefined;
    if (user?.role !== "ADMIN") {
      // Not admin, redirect to accounts with error
      router.push("/accounts?error=access-denied");
      return;
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated or not admin
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <Alert
            type="error"
            message="Truy cập bị từ chối"
            description="Bạn không có quyền truy cập vào trang quản trị. Chỉ có admin mới có thể truy cập."
            showIcon
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
