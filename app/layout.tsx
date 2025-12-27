import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

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
  title: "고강도 피트니스 트레이닝 | PACE",
  description:
    "하이록스 스타일의 검증된 8단계 훈련 커리큘럼. 매일 주어지는 과제와 전문 코치의 실시간 피드백으로 당신의 한계를 갱신하세요.",
  keywords: ["피트니스", "하이록스", "트레이닝", "코칭", "운동 프로그램"],
  openGraph: {
    title: "당신의 한계는 매일 갱신된다",
    description: "고강도 피트니스 트레이닝 프로그램",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
