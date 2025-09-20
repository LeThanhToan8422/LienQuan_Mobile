"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to accounts page immediately
    router.replace("/accounts");
  }, [router]);

  // Show loading spinner while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
