import Link from "next/link";

export const metadata = {
  title: "개발자 정보 | 한국외대 맛집 지도",
  description: "한국외대 맛집 지도 개발자 정보",
};

export default function DeveloperPage() {
  return (
    <main className="main-container" role="main">
      <section className="developer-section">
        <h1 className="text-gold">👨‍💻 Developer</h1>

        <div className="developer-card">
          <div className="developer-name">SlowMan</div>
          <div className="developer-info">
            <strong>한국외국어대학교</strong>
            <br />
            수학과 22학번
          </div>
          <div className="developer-name">MintPansy</div>
          <div className="developer-info">
            <strong>한국외국어대학교</strong>
            <br />
            통계학과 22학번
          </div>

          <div
            style={{
              marginTop: "2rem",
              paddingTop: "2rem",
              borderTop: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <p
              style={{
                color: "var(--hufs-silver)",
                fontSize: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              맛집 데이터 수정 문의를 환영합니다!
              <br />
              오류나 개선 사항이 있으면 언제든지 연락주세요.
            </p>
            <a
              href="https://open.kakao.com/o/sdpf2cih"
              className="btn btn-gold"
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 카카오톡 오픈채팅
            </a>
          </div>
        </div>

        <div style={{ marginTop: "3rem" }}>
          <Link href="/" className="btn btn-secondary">
            🏠 홈으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
