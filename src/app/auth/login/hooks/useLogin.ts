"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export type LoginFormValues = { email: string; password: string };

export default function useLogin(callbackUrl?: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });
      
      if (res?.ok) {
        // Fetch session to get user id/role via /api/auth/session
        try {
          const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
          const session = sessionRes.ok ? await sessionRes.json() : null;
          const userId = session?.user?.id as string | undefined;
          const role = session?.user?.role as string | undefined;
          if (userId && role) {
            await fetch("/api/auth/session-cookie", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, role }),
            });
          }
        } catch (_) {
          // ignore cookie set failure and continue redirect
        }
        // Stop loading immediately
        setLoading(false);
        
        // Determine redirect URL
        let redirectUrl = "/accounts"; // Default to accounts page
        
        // If there's a callbackUrl, use it (e.g., when user tries to access admin)
        if (callbackUrl) {
          redirectUrl = callbackUrl;
        }
        
        // Use window.location.href for reliable redirect
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
