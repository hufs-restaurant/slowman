import { getRestaurants } from "@/lib/restaurants";
import Hero from "@/components/Hero";
import Filter from "@/components/Filter";
import AIButton from "@/components/AIButton";
import type { RestaurantWithCampus } from "../lib/restaurant.types";
import Link from "next/link";

export const revalidate = 3600; // ISR: 1시간

export default async function HomePage() {
  const data = await getRestaurants();

  const allRestaurants: RestaurantWithCampus[] = [
    ...data.seoul.restaurants.map((r) => ({ ...r, campus: "seoul" as const })),
    ...data.global.restaurants.map((r) => ({
      ...r,
      campus: "global" as const,
    })),
  ];

  return (
    <main className="main-container" role="main">
      <Hero />

      <Filter restaurants={allRestaurants} />

      <div className="feature-buttons">
        <AIButton />
        <Link href="/random" className="btn btn-gold btn-small">
          🍽️ 오늘 뭐 먹지?
        </Link>
        <Link href="/developer" className="btn btn-secondary btn-small">
          👨‍💻 개발자 정보
        </Link>
      </div>

      <aside className="disclaimer" role="contentinfo">
        <strong>면책 조항</strong>
        <br />
        본 사이트는 상업적 목적이 아님을 밝힙니다. 본 사이트는 개발자 본인의
        개인적인 사이트임을 밝힙니다. 개발자 본인이 매번 맛집 검색하기가
        귀찮아서 만들었습니다. 맛집 선정에는 외대생들의 개인 취향이 반영되었습니다.
      </aside>
    </main>
  );
}
