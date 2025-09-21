"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
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
      // Use signIn with redirect: false to check session after login
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });
      
      if (res?.ok) {
        const logMessage = "✅ Login successful, starting session polling...";
        console.log(logMessage);
        localStorage.setItem('debug-login', JSON.stringify({ step: 'login-success', message: logMessage, timestamp: new Date().toISOString() }));
        
        // Poll for session update until it's available
        let session = null;
        let attempts = 0;
        const maxAttempts = 20; // Maximum 10 seconds (20 * 500ms)
        
        while (!session && attempts < maxAttempts) {
          const pollMessage = `🔄 Polling session attempt ${attempts + 1}/${maxAttempts}`;
          console.log(pollMessage);
          localStorage.setItem('debug-login', JSON.stringify({ step: 'polling', message: pollMessage, attempt: attempts + 1, timestamp: new Date().toISOString() }));
          
          await new Promise(resolve => setTimeout(resolve, 500));
          session = await getSession();
          attempts++;
          
          if (session) {
            const sessionMessage = "✅ Session found:";
            const sessionData = {
              user: session.user,
              role: (session.user as { role?: string })?.role,
              expires: session.expires
            };
            console.log(sessionMessage, sessionData);
            localStorage.setItem('debug-login', JSON.stringify({ step: 'session-found', message: sessionMessage, data: sessionData, timestamp: new Date().toISOString() }));
          }
        }
        
        if (!session) {
          const errorMessage = `❌ Session polling timeout after ${attempts} attempts`;
          console.error(errorMessage);
          localStorage.setItem('debug-login', JSON.stringify({ step: 'timeout', message: errorMessage, attempts, timestamp: new Date().toISOString() }));
          setError("Không thể tải thông tin phiên đăng nhập");
          setLoading(false);
          return;
        }
        
        const user = session.user as { role?: string } | undefined;
        const roleMessage = `👤 User role detected: ${user?.role}`;
        console.log(roleMessage);
        localStorage.setItem('debug-login', JSON.stringify({ step: 'role-detected', message: roleMessage, role: user?.role, timestamp: new Date().toISOString() }));
        
        // Determine redirect URL based on user role
        let redirectUrl = callbackUrl;
        
        if (!redirectUrl) {
          // If no callbackUrl provided, redirect based on user role
          if (user?.role === "ADMIN") {
            redirectUrl = "/admin";
            const redirectMessage = `🔀 Redirecting admin to: ${redirectUrl}`;
            console.log(redirectMessage);
            localStorage.setItem('debug-login', JSON.stringify({ step: 'redirect-admin', message: redirectMessage, url: redirectUrl, timestamp: new Date().toISOString() }));
          } else {
            redirectUrl = "/accounts";
            const redirectMessage = `🔀 Redirecting user to: ${redirectUrl}`;
            console.log(redirectMessage);
            localStorage.setItem('debug-login', JSON.stringify({ step: 'redirect-user', message: redirectMessage, url: redirectUrl, timestamp: new Date().toISOString() }));
          }
        } else {
          const callbackMessage = `🔀 Using callbackUrl: ${redirectUrl}`;
          console.log(callbackMessage);
          localStorage.setItem('debug-login', JSON.stringify({ step: 'redirect-callback', message: callbackMessage, url: redirectUrl, timestamp: new Date().toISOString() }));
        }
        
        // Redirect to the appropriate page
        const finalMessage = `🚀 Executing redirect to: ${redirectUrl}`;
        console.log(finalMessage);
        localStorage.setItem('debug-login', JSON.stringify({ step: 'executing-redirect', message: finalMessage, url: redirectUrl, timestamp: new Date().toISOString() }));
        
        router.push(redirectUrl);
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
