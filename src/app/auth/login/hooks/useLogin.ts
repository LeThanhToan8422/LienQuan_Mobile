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
