"use client";

import { useState, useCallback } from "react";
import Filter from "./Filter";
import AIButton from "./AIButton";
import RestaurantModal from "./RestaurantModal";
import type { Restaurant, RestaurantWithCampus, CampusKey } from "../lib/restaurant.types";

interface RandomPageClientProps {
  seoulRestaurants: { name: string; category: string }[];
  globalRestaurants: { name: string; category: string }[];
  allRestaurants: RestaurantWithCampus[];
}

export default function RandomPageClient({
  seoulRestaurants,
  globalRestaurants,
  allRestaurants,
}: RandomPageClientProps) {
  const [seoulResult, setSeoulResult] = useState<Restaurant | null>(null);
  const [globalResult, setGlobalResult] = useState<Restaurant | null>(null);
  const [modalRestaurant, setModalRestaurant] = useState<{
    restaurant: Restaurant;
    campus: CampusKey;
  } | null>(null);

  const pickSeoul = useCallback(() => {
    const idx = Math.floor(Math.random() * seoulRestaurants.length);
    setSeoulResult(seoulRestaurants[idx]);
  }, [seoulRestaurants]);

  const pickGlobal = useCallback(() => {
    const idx = Math.floor(Math.random() * globalRestaurants.length);
    setGlobalResult(globalRestaurants[idx]);
  }, [globalRestaurants]);

  const handleResultClick = useCallback((restaurant: Restaurant, campus: CampusKey) => {
    setModalRestaurant({ restaurant, campus });
  }, []);

  return (
    <>
      <Filter restaurants={allRestaurants} />

      <div className="campus-selector">
        <div className="campus-card">
          <h3>Seoul Campus</h3>
          <button type="button" className="menu-button" onClick={pickSeoul}>
            🎲 랜덤 뽑기
          </button>
          <div
            className={`menu-result ${seoulResult ? "show" : "empty"}`}
            role="button"
            tabIndex={0}
            onClick={() =>
              seoulResult && handleResultClick(seoulResult, "seoul")
            }
            onKeyDown={(e) =>
              seoulResult &&
              e.key === "Enter" &&
              handleResultClick(seoulResult, "seoul")
            }
          >
            {seoulResult?.name || ""}
          </div>
        </div>

        <div className="campus-card">
          <h3>Global Campus</h3>
          <button type="button" className="menu-button" onClick={pickGlobal}>
            🎲 랜덤 뽑기
          </button>
          <div
            className={`menu-result ${globalResult ? "show" : "empty"}`}
            role="button"
            tabIndex={0}
            onClick={() =>
              globalResult && handleResultClick(globalResult, "global")
            }
            onKeyDown={(e) =>
              globalResult &&
              e.key === "Enter" &&
              handleResultClick(globalResult, "global")
            }
          >
            {globalResult ? `${globalResult.name} (${globalResult.category || "카테고리 없음"})` : ""}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "2rem",
        }}
      >
        <AIButton />
      </div>

      {modalRestaurant && (
        <RestaurantModal
          restaurant={modalRestaurant.restaurant}
          campus={modalRestaurant.campus}
          onClose={() => setModalRestaurant(null)}
        />
      )}
    </>
  );
}
