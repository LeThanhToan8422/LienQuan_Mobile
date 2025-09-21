"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";

export type LoginFormValues = { email: string; password: string };

export default function useLogin(callbackUrl?: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use signIn with redirect: false to check session after login
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });
      
      if (res?.ok) {
        console.log("✅ Login successful, starting session polling...");
        
        // Poll for session update until it's available
        let session = null;
        let attempts = 0;
        const maxAttempts = 20; // Maximum 10 seconds (20 * 500ms)
        
        while (!session && attempts < maxAttempts) {
          console.log(`🔄 Polling session attempt ${attempts + 1}/${maxAttempts}`);
          await new Promise(resolve => setTimeout(resolve, 500));
          session = await getSession();
          attempts++;
          
          if (session) {
            console.log("✅ Session found:", {
              user: session.user,
              role: (session.user as { role?: string })?.role,
              expires: session.expires
            });
          }
        }
        
        if (!session) {
          console.error("❌ Session polling timeout after", attempts, "attempts");
          setError("Không thể tải thông tin phiên đăng nhập");
          setLoading(false);
          return;
        }
        
        const user = session.user as { role?: string } | undefined;
        console.log("👤 User role detected:", user?.role);
        
        // Determine redirect URL based on user role
        let redirectUrl = callbackUrl;
        
        if (!redirectUrl) {
          // If no callbackUrl provided, redirect based on user role
          if (user?.role === "ADMIN") {
            redirectUrl = "/admin";
            console.log("🔀 Redirecting admin to:", redirectUrl);
          } else {
            redirectUrl = "/accounts";
            console.log("🔀 Redirecting user to:", redirectUrl);
          }
        } else {
          console.log("🔀 Using callbackUrl:", redirectUrl);
        }
        
        // Redirect to the appropriate page
        console.log("🚀 Executing redirect to:", redirectUrl);
        window.location.href = redirectUrl;
      } else {
        setError("Email hoặc mật khẩu không đúng");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Có lỗi xảy ra khi đăng nhập");
      setLoading(false);
    }
  };

  return { loading, error, onFinish };
}
