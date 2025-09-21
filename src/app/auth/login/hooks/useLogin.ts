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
        // Wait a bit for session to be updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get the updated session to check user role
        const session = await getSession();
        const user = session?.user as { role?: string } | undefined;
        
        // Determine redirect URL based on user role
        let redirectUrl = callbackUrl;
        
        if (!redirectUrl) {
          // If no callbackUrl provided, redirect based on user role
          if (user?.role === "ADMIN") {
            redirectUrl = "/admin";
          } else {
            redirectUrl = "/accounts";
          }
        }
        
        // Redirect to the appropriate page
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
