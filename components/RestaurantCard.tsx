"use client";

import Link from "next/link";
import type { Restaurant, CampusKey } from "../lib/restaurant.types";

interface RestaurantCardProps {
  restaurant: Restaurant;
  campus: CampusKey;
  variant?: "search" | "full";
  onClick?: () => void;
}

function getMapUrls(name: string, campus: CampusKey) {
  const loc = campus === "seoul" ? "이문동" : "용인시 처인구 모현읍";
  return {
    naver: `https://map.naver.com/v5/search/${encodeURIComponent(`${loc} ${name}`)}`,
    kakao: `https://map.kakao.com/link/search/${encodeURIComponent(`${loc} ${name}`)}`,
  };
}

export default function RestaurantCard({
  restaurant,
  campus,
  variant = "search",
  onClick,
}: RestaurantCardProps) {
  const urls = getMapUrls(restaurant.name, campus);

  if (variant === "search") {
    return (
      <article
        className="search-result-item"
        role="listitem"
        onClick={onClick}
        onKeyDown={(e) => onClick && e.key === "Enter" && onClick()}
        style={onClick ? { cursor: "pointer" } : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <div className="search-result-name">{restaurant.name}</div>
        <div className="search-result-category">
          {restaurant.category || "카테고리 없음"}
        </div>
        <div className="search-result-actions" onClick={(e) => e.stopPropagation()}>
          <a
            href={urls.naver}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-link"
            aria-label={`${restaurant.name} 네이버지도에서 보기`}
          >
            네이버지도
          </a>
          <a
            href={urls.kakao}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-link"
            aria-label={`${restaurant.name} 카카오맵에서 보기`}
          >
            카카오맵
          </a>
        </div>
      </article>
    );
  }

  return (
    <article className="card" role="listitem">
      <h3>{restaurant.name}</h3>
      <p className="text-silver">{restaurant.category || "카테고리 없음"}</p>
      <div className="modal-actions">
        <a href={urls.naver} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-small">
          네이버지도
        </a>
        <a href={urls.kakao} target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-small">
          카카오맵
        </a>
      </div>
    </article>
  );
}
