"use client";

import { useSession, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Spin, Alert } from "antd";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Wait for session to load completely
    if (status === "loading") return;

    // If session is already available, check it immediately
    if (session) {
      const user = session.user as { role?: string } | undefined;
      if (user?.role === "ADMIN") {
        setHasCheckedAuth(true);
        return;
      } else {
        // Not admin, redirect to accounts with error
        window.location.href = "/accounts?error=access-denied";
        return;
      }
    }

    // If no session yet, start polling for it
    let attempts = 0;
    const maxAttempts = 20; // Maximum 10 seconds (20 * 500ms)
    
    const pollSession = async () => {
      if (attempts >= maxAttempts) {
        // Timeout - redirect to login
        window.location.href = "/auth/login?callbackUrl=/admin";
        return;
      }

      attempts++;
      
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get fresh session data
      const freshSession = await getSession();
      if (freshSession) {
        const user = freshSession.user as { role?: string } | undefined;
        if (user?.role === "ADMIN") {
          setHasCheckedAuth(true);
        } else {
          window.location.href = "/accounts?error=access-denied";
        }
      } else {
        // Continue polling
        pollSession();
      }
    };

    pollSession();
  }, [session, status]);

  // Show loading while checking authentication
  if (status === "loading" || !hasCheckedAuth) {
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
