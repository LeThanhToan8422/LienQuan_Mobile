"use client";

import { useSession, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spin, Alert } from "antd";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("🔍 AdminLayout useEffect triggered:", { status, session: !!session, hasCheckedAuth });
    localStorage.setItem('debug-admin-layout', JSON.stringify({ 
      step: 'useEffect-triggered', 
      status, 
      hasSession: !!session, 
      hasCheckedAuth,
      timestamp: new Date().toISOString() 
    }));
    
    // Wait for session to load completely
    if (status === "loading") {
      console.log("⏳ Session still loading...");
      localStorage.setItem('debug-admin-layout', JSON.stringify({ 
        step: 'session-loading', 
        message: "Session still loading...",
        timestamp: new Date().toISOString() 
      }));
      return;
    }

    // If session is already available, check it immediately
    if (session) {
      console.log("✅ Session available immediately:", {
        user: session.user,
        role: (session.user as { role?: string })?.role
      });
      
      const user = session.user as { role?: string } | undefined;
      if (user?.role === "ADMIN") {
        console.log("✅ Admin role confirmed, setting hasCheckedAuth = true");
        setHasCheckedAuth(true);
        return;
      } else {
        console.log("❌ Not admin role, redirecting to accounts");
        // Not admin, redirect to accounts with error
        router.push("/accounts?error=access-denied");
        return;
      }
    }

    console.log("🔄 No session available, starting polling...");
    // If no session yet, start polling for it
    let attempts = 0;
    const maxAttempts = 20; // Maximum 10 seconds (20 * 500ms)
    
    const pollSession = async () => {
      console.log(`🔄 AdminLayout polling attempt ${attempts + 1}/${maxAttempts}`);
      
      if (attempts >= maxAttempts) {
        console.log("❌ AdminLayout polling timeout, redirecting to login");
        // Timeout - redirect to login
        router.push("/auth/login?callbackUrl=/admin");
        return;
      }

      attempts++;
      
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get fresh session data
      const freshSession = await getSession();
      console.log("🔍 Fresh session check:", { 
        hasSession: !!freshSession,
        user: freshSession?.user,
        role: freshSession?.user ? (freshSession.user as { role?: string })?.role : 'no user'
      });
      
      if (freshSession) {
        const user = freshSession.user as { role?: string } | undefined;
        if (user?.role === "ADMIN") {
          console.log("✅ Admin role found via polling, setting hasCheckedAuth = true");
          setHasCheckedAuth(true);
        } else {
          console.log("❌ Non-admin role found via polling, redirecting to accounts");
          router.push("/accounts?error=access-denied");
        }
      } else {
        console.log("⏳ No session yet, continuing to poll...");
        // Continue polling
        pollSession();
      }
    };

    pollSession();
  }, [session, status]);

  // Show loading while checking authentication
  if (status === "loading" || !hasCheckedAuth) {
    console.log("🔄 AdminLayout rendering loading state:", { status, hasCheckedAuth });
    localStorage.setItem('debug-admin-layout', JSON.stringify({ 
      step: 'rendering-loading', 
      status, 
      hasCheckedAuth,
      message: "Rendering loading state",
      timestamp: new Date().toISOString() 
    }));
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
    console.log("❌ AdminLayout rendering error state:", { 
      hasSession: !!session, 
      role: session?.user ? (session.user as { role?: string })?.role : 'no user' 
    });
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

  console.log("✅ AdminLayout rendering children - admin access granted");
  return <>{children}</>;
}
