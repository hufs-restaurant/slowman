import Link from "next/link";
import TableauMap from "@/components/TableauMap";

export const metadata = {
  title: "서울캠퍼스 맛집 지도 | 한국외대 맛집 지도",
  description: "서울캠퍼스 맛집 지도",
};

const TABLEAU_NAME = "250301_/03014_1";
const TABLEAU_IMG =
  "https://public.tableau.com/static/images/25/250301_/03014_1/1_rss.png";

export default function SeoulMapPage() {
  return (
    <main className="map-container" role="main">
      <div className="map-header">
        <h1>서울캠퍼스 맛집 지도</h1>
        <p>Seoul Campus Restaurant Map</p>
      </div>

      <div className="map-controls">
        <Link href="/" className="btn btn-gold btn-small">
          🏠 홈으로
        </Link>
      </div>

      <div className="map-info">
        💡 <strong>사용 방법:</strong> 지도에서 맛집을 클릭하면 상세 정보를 볼
        수 있습니다. 확대/축소 및 이동이 가능합니다.
      </div>

      <div className="tableau-wrapper">
        <TableauMap
          vizId="seoul-viz"
          tableauName={TABLEAU_NAME}
          alt="서울캠퍼스 맛집 지도"
          staticImg={TABLEAU_IMG}
        />
      </div>
    </main>
  );
}
