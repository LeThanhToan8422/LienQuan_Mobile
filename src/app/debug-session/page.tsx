"use client";

import { useSession, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, Typography, Button, Space, Alert } from "antd";

export default function DebugSessionPage() {
  const { data: session, status } = useSession();
  const [freshSession, setFreshSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const refreshSession = async () => {
    setLoading(true);
    try {
      const newSession = await getSession();
      setFreshSession(newSession);
      console.log("Fresh session:", newSession);
    } catch (error) {
      console.error("Error getting fresh session:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Card title="Debug Session Information">
        <Space direction="vertical" size="large" className="w-full">
          <div>
            <Typography.Title level={4}>useSession() Data:</Typography.Title>
            <Typography.Text code>
              Status: {status}
            </Typography.Text>
            <br />
            <Typography.Text code>
              Has Session: {session ? "Yes" : "No"}
            </Typography.Text>
            <br />
            <Typography.Text code>
              User: {session?.user ? JSON.stringify(session.user, null, 2) : "No user"}
            </Typography.Text>
            <br />
            <Typography.Text code>
              Role: {session?.user ? (session.user as { role?: string })?.role : "No role"}
            </Typography.Text>
            <br />
            <Typography.Text code>
              Expires: {session?.expires || "No expires"}
            </Typography.Text>
          </div>

          <div>
            <Typography.Title level={4}>getSession() Data:</Typography.Title>
            <Button onClick={refreshSession} loading={loading}>
              Refresh Session
            </Button>
            <br />
            <Typography.Text code>
              Has Session: {freshSession ? "Yes" : "No"}
            </Typography.Text>
            <br />
            <Typography.Text code>
              User: {freshSession?.user ? JSON.stringify(freshSession.user, null, 2) : "No user"}
            </Typography.Text>
            <br />
            <Typography.Text code>
              Role: {freshSession?.user ? (freshSession.user as { role?: string })?.role : "No role"}
            </Typography.Text>
            <br />
            <Typography.Text code>
              Expires: {freshSession?.expires || "No expires"}
            </Typography.Text>
          </div>

          <div>
            <Typography.Title level={4}>Current URL:</Typography.Title>
            <Typography.Text code>
              {typeof window !== "undefined" ? window.location.href : "Server side"}
            </Typography.Text>
          </div>

          <div>
            <Typography.Title level={4}>Actions:</Typography.Title>
            <Space>
              <Button 
                type="primary" 
                onClick={() => window.location.href = "/admin"}
              >
                Go to Admin
              </Button>
              <Button 
                onClick={() => window.location.href = "/accounts"}
              >
                Go to Accounts
              </Button>
              <Button 
                onClick={() => window.location.href = "/auth/login"}
              >
                Go to Login
              </Button>
            </Space>
          </div>

          {session && (session.user as { role?: string })?.role === "ADMIN" && (
            <Alert
              type="success"
              message="Admin Access Confirmed"
              description="You have admin role and should be able to access admin pages."
              showIcon
            />
          )}
        </Space>
      </Card>
    </div>
  );
}
