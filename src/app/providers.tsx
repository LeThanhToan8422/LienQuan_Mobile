"use client";

import { SessionProvider } from "next-auth/react";
import { ConfigProvider, App } from "antd";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ConfigProvider theme={{ token: { colorPrimary: "#1677ff" } }}>
        <App>
          {children}
        </App>
      </ConfigProvider>
    </SessionProvider>
  );
}