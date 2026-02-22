import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "한국외대 맛집 지도 | HUFS Restaurant Guide Map",
  description:
    "한국외국어대학교 서울캠퍼스, 글로벌캠퍼스 맛집 가이드. 외대생을 위한 맛집 추천 및 지도",
  keywords: ["한국외대", "맛집", "HUFS", "이문동", "외대", "식당"],
  openGraph: {
    title: "한국외대 맛집 지도",
    description: "한국외국어대학교 맛집 가이드 - 서울캠퍼스, 글로벌캠퍼스",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={notoSans.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
