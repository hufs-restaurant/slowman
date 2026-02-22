import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="footer"
      role="contentinfo"
      aria-label="사이트 푸터"
    >
      <div className="footer-text">
        <p>한국외국어대학교 맛집 가이드</p>
        <p>HUFS Restaurant Guide Map</p>
        <p>개발자: SlowMan, MintPansy</p>
      </div>
      <nav aria-label="푸터 링크">
        <div className="footer-links">
          <Link href="/">홈으로</Link>
          <Link href="/random">랜덤 메뉴</Link>
          <Link href="/developer">개발자 정보</Link>
          <a href="https://open.kakao.com/o/sdpf2cih" target="_blank" rel="noopener noreferrer">
            문의하기
          </a>
        </div>
      </nav>
    </footer>
  );
}
