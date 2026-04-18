import type { Metadata } from "next";
import "./globals.css";

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
      <body style={{ fontFamily: "-apple-system, 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', sans-serif" }}>{children}</body>
    </html>
  );
}
