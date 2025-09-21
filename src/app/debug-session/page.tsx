"use client";

import { useSession, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, Typography, Button, Space, Alert } from "antd";

export default function DebugSessionPage() {
  const { data: session, status } = useSession();
  const [freshSession, setFreshSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [debugLogs, setDebugLogs] = useState<any[]>([]);

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

  const loadDebugLogs = () => {
    try {
      const logs = localStorage.getItem('debug-login');
      if (logs) {
        const parsedLogs = JSON.parse(logs);
        setDebugLogs(Array.isArray(parsedLogs) ? parsedLogs : [parsedLogs]);
      }
    } catch (error) {
      console.error("Error loading debug logs:", error);
    }
  };

  useEffect(() => {
    refreshSession();
    loadDebugLogs();
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
            <Typography.Title level={4}>Debug Logs (from localStorage):</Typography.Title>
            <Button onClick={loadDebugLogs} className="mb-2">
              Refresh Debug Logs
            </Button>
            {debugLogs.length > 0 ? (
              <div className="bg-gray-100 p-4 rounded max-h-60 overflow-y-auto">
                {debugLogs.map((log, index) => (
                  <div key={index} className="mb-2 text-sm">
                    <Typography.Text strong>{log.step}:</Typography.Text> {log.message}
                    <br />
                    <Typography.Text type="secondary" className="text-xs">
                      {log.timestamp}
                    </Typography.Text>
                    {log.data && (
                      <div className="mt-1">
                        <Typography.Text code className="text-xs">
                          {JSON.stringify(log.data, null, 2)}
                        </Typography.Text>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Typography.Text type="secondary">No debug logs found</Typography.Text>
            )}
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
              <Button 
                onClick={() => localStorage.removeItem('debug-login')}
                danger
              >
                Clear Debug Logs
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
