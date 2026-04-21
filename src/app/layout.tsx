import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "红薯榜单 | 发现高能小红书营销活动",
  description: "Kickstarter 式小红书拼单营销平台，连接实体商家与优质 KOL。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-bg-main text-text-primary min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
