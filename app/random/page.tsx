import { getRestaurants } from "@/lib/restaurants";
import RandomPageClient from "@/components/RandomPageClient";
import Link from "next/link";
import type { RestaurantWithCampus } from "../../lib/restaurant.types";

export const metadata = {
  title: "랜덤 메뉴 | 한국외대 맛집 지도",
  description: "랜덤으로 맛집을 추천받아보세요.",
};

export const revalidate = 3600;

export default async function RandomPage() {
  const data = await getRestaurants();
  const seoulRestaurants = data.seoul.restaurants;
  const globalRestaurants = data.global.restaurants;
  const allRestaurants: RestaurantWithCampus[] = [
    ...seoulRestaurants.map((r) => ({ ...r, campus: "seoul" as const })),
    ...globalRestaurants.map((r) => ({ ...r, campus: "global" as const })),
  ];

  return (
    <main className="main-container" role="main">
      <section className="random-menu-section">
        <h1 className="menu-title">🍽️ 오늘 뭐 먹지?</h1>
        <p className="text-center text-silver" style={{ marginBottom: "2rem" }}>
          랜덤으로 맛집을 추천해드립니다!
        </p>

        <RandomPageClient
          seoulRestaurants={seoulRestaurants}
          globalRestaurants={globalRestaurants}
          allRestaurants={allRestaurants}
        />

        <div
          className="back-button"
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "3rem",
          }}
        >
          <Link href="/" className="btn btn-secondary">
            🏠 홈으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
