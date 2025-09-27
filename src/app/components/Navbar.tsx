"use client";

import { Button, Dropdown, Space } from "antd";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user as { id?: string; email?: string; name?: string; role?: string } | undefined;

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link href="/profile">Thông tin cá nhân</Link>,
    },
    ...(user?.role === "ADMIN" ? [
      {
        key: "admin",
        icon: <SettingOutlined />,
        label: <Link href="/admin">Quản trị</Link>,
      }
    ] : []),
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: () => signOut({ callbackUrl: "/" }),
    },
  ];

  return (
    <header className="border-b bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          LQ Shop
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/accounts">Tài khoản</Link>
          
          {status === "loading" ? (
            <div>Loading...</div>
          ) : session ? (
            <Space>
              {user?.role === "ADMIN" && (
                <Link href="/admin">
                  <Button type="link" size="small" className="text-red-600">
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Button type="text" size="small">
                  <Space>
                    <UserOutlined />
                    {user?.name || user?.email || "User"}
                    {user?.role === "ADMIN" && (
                      <span className="text-xs bg-red-100 text-red-600 px-1 rounded">
                        ADMIN
                      </span>
                    )}
                  </Space>
                </Button>
              </Dropdown>
            </Space>
          ) : (
            <Space>
              <Link href="/auth/login">Đăng nhập</Link>
              <Link href="/auth/register">Đăng ký</Link>
            </Space>
          )}
        </nav>
      </div>
    </header>
  );
}