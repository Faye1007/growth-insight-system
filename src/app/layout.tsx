import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Growth Insight System",
  description: "Personal growth insight dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
