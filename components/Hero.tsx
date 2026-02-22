import Link from "next/link";
import Image from "next/image";

const LOGO_SRC = "/외대로고.jpeg";

export default function Hero() {
  return (
    <section
      className="hero-section"
      aria-labelledby="hero-title"
    >
      <h1 id="hero-title">한국외대 맛집 지도</h1>
      <p className="hero-subtitle">HUFS Restaurant Guide Map</p>

      <div className="hero-logo-wrap">
        <Image
          src={LOGO_SRC}
          alt="한국외대 로고"
          className="hero-logo"
          width={200}
          height={120}
          loading="lazy"
        />
      </div>

      <div
        className="campus-buttons"
        role="navigation"
        aria-label="캠퍼스별 맛집 지도"
      >
        <Link href="/map/seoul" className="campus-button">
          <h2>Seoul Campus</h2>
          <p>서울캠퍼스 맛집 지도</p>
        </Link>
        <Link href="/map/global" className="campus-button">
          <h2>Global Campus</h2>
          <p>글로벌캠퍼스 맛집 지도</p>
        </Link>
      </div>
    </section>
  );
}
