"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

export default function useRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    setError(null);
    setOk(false);
    
    try {
      // Remove confirmPassword from the payload
      const { confirmPassword: _, ...payload } = values;
      
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setOk(true);
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push("/auth/login?message=registration-success");
        }, 2000);
      } else {
        setError(data.error || "Đăng ký thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, ok, onFinish };
}
