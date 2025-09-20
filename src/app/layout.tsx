import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "antd/dist/reset.css";
import Providers from "./providers";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LQ Shop",
  description: "Shop bán account Liên Quân Mobile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t">
            <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500">
              © {new Date().getFullYear()} LQ Shop
            </div>
          </footer>
        </Providers>
        <div id="message-container"></div>
      </body>
    </html>
  );
}
