"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

export type LoginFormValues = { email: string; password: string };

export default function useLogin(callbackUrl?: string | null) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);
    
    const res = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });
    
    if (res?.ok) {
      // Get the updated session to check user role
      const session = await getSession();
      const user = session?.user as { role?: string } | undefined;
      
      // Get the callback URL or determine redirect based on role
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        // Redirect based on user role
        if (user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/accounts");
        }
      }
    } else {
      setError("Email hoặc mật khẩu không đúng");
    }
    
    setLoading(false);
  };

  return { loading, error, onFinish };
}
