"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const LOGO_SRC = "/외대로고.jpeg";

const TITLES: Record<string, string> = {
  "/": "한국외대 맛집 지도",
  "/random": "랜덤 메뉴 추천",
  "/developer": "개발자 정보",
  "/map/seoul": "서울캠퍼스 맛집 지도",
  "/map/global": "글로벌캠퍼스 맛집 지도",
};

export default function Header() {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "한국외대 맛집 지도";
  return (
    <header className="header" role="banner" aria-label="사이트 헤더">
      <Link href="/" className="header-logo" aria-label="홈으로 이동">
        <Image
          src={LOGO_SRC}
          alt="한국외대 로고"
          width={120}
          height={40}
          className="header-logo-img"
        />
        <span className="header-title">{title}</span>
      </Link>
      <nav aria-label="메인 네비게이션">
        <ul className="nav-menu">
          <li><Link href="/">홈</Link></li>
          <li><Link href="/random">랜덤 메뉴</Link></li>
          <li><Link href="/map/seoul">서울캠</Link></li>
          <li><Link href="/map/global">글로벌캠</Link></li>
          <li><Link href="/developer">개발자</Link></li>
        </ul>
      </nav>
    </header>
  );
}
