"use client";

import { useCallback, useState, useTransition } from "react";
import type { RestaurantWithCampus } from "../lib/restaurant.types";
import RestaurantCard from "./RestaurantCard";
import RestaurantModal from "./RestaurantModal";

interface FilterProps {
  restaurants: RestaurantWithCampus[];
}

export default function Filter({ restaurants }: FilterProps) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<RestaurantWithCampus[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<RestaurantWithCampus | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      setQuery(value);

      startTransition(() => {
        if (!value) {
          setFiltered(null);
          return;
        }
        const q = value.toLowerCase();
        const results = restaurants.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            (r.category || "").toLowerCase().includes(q)
        );
        setFiltered(results);
      });
    },
    [restaurants]
  );

  const seoulResults = filtered?.filter((r) => r.campus === "seoul") ?? [];
  const globalResults = filtered?.filter((r) => r.campus === "global") ?? [];

  return (
    <div
      className="search-container"
      role="search"
      aria-label="맛집 검색"
    >
      <div className="search-box">
        <input
          type="search"
          className="search-input"
          placeholder="맛집 이름 또는 카테고리로 검색..."
          value={query}
          onChange={handleChange}
          aria-label="맛집 검색어 입력"
          aria-describedby="search-results-label"
          autoComplete="off"
        />
        <span className="search-icon" aria-hidden="true">
          🔍
        </span>
      </div>

      <div
        id="search-results"
        className={`search-results ${filtered !== null ? "show" : ""}`}
        role="list"
        aria-label="검색 결과"
      >
        {isPending && <p className="text-silver">검색 중...</p>}
        {!isPending && filtered !== null && (
          <>
            {filtered.length === 0 ? (
              <p id="no-results" className="no-results show">
                검색 결과가 없습니다.
              </p>
            ) : (
              <>
                {seoulResults.length > 0 && (
                  <div className="campus-group" role="group" aria-label="서울캠퍼스 검색 결과">
                    <h3>📍 서울캠퍼스</h3>
                    {seoulResults.map((r) => (
                      <RestaurantCard
                        key={`seoul-${r.name}`}
                        restaurant={r}
                        campus="seoul"
                        onClick={() => setSelected(r)}
                      />
                    ))}
                  </div>
                )}
                {globalResults.length > 0 && (
                  <div className="campus-group" role="group" aria-label="글로벌캠퍼스 검색 결과">
                    <h3>🌍 글로벌캠퍼스</h3>
                    {globalResults.map((r) => (
                      <RestaurantCard
                        key={`global-${r.name}`}
                        restaurant={r}
                        campus="global"
                        onClick={() => setSelected(r)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {selected && (
        <RestaurantModal
          restaurant={selected}
          campus={selected.campus}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
