import type { Metadata } from "next";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "ARIA 财务模型模拟器",
  description: "ARIA ICU谵妄预警系统 — 投资人路演版财务模拟器",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body style={{ fontFamily: "-apple-system, 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-cyan-600 focus:text-white">
          跳转到主内容
        </a>
        <ErrorBoundary>
          <main id="main-content" role="main">
            {children}
          </main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
