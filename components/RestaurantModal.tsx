"use client";

import type { Restaurant, CampusKey } from "../lib/restaurant.types";

interface RestaurantModalProps {
  restaurant: Restaurant;
  campus: CampusKey;
  onClose: () => void;
}

function getMapUrls(name: string, campus: CampusKey) {
  const loc = campus === "seoul" ? "이문동" : "용인시 처인구 모현읍";
  return {
    naver: `https://map.naver.com/v5/search/${encodeURIComponent(`${loc} ${name}`)}`,
    kakao: `https://map.kakao.com/link/search/${encodeURIComponent(`${loc} ${name}`)}`,
  };
}

export default function RestaurantModal({
  restaurant,
  campus,
  onClose,
}: RestaurantModalProps) {
  const urls = getMapUrls(restaurant.name, campus);
  const campusName = campus === "seoul" ? "서울캠퍼스" : "글로벌캠퍼스";

  return (
    <div
      className="modal-overlay show"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restaurant-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="restaurant-modal-title" className="modal-title">
            {restaurant.name}
          </h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="닫기"
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="restaurant-info">
            <div className="restaurant-info-item">
              <span className="restaurant-info-label">카테고리:</span>
              <span className="restaurant-info-value">
                {restaurant.category || "정보 없음"}
              </span>
            </div>
            <div className="restaurant-info-item">
              <span className="restaurant-info-label">캠퍼스:</span>
              <span className="restaurant-info-value">{campusName}</span>
            </div>
            {restaurant.address && (
              <div className="restaurant-info-item">
                <span className="restaurant-info-label">주소:</span>
                <span className="restaurant-info-value">{restaurant.address}</span>
              </div>
            )}
            {restaurant.phone && (
              <div className="restaurant-info-item">
                <span className="restaurant-info-label">전화:</span>
                <span className="restaurant-info-value">{restaurant.phone}</span>
              </div>
            )}
            {restaurant.rating != null && (
              <div className="restaurant-info-item">
                <span className="restaurant-info-label">평점:</span>
                <span className="restaurant-info-value">
                  {restaurant.rating}/5
                  {restaurant.review_count != null && ` (리뷰 ${restaurant.review_count}개)`}
                </span>
              </div>
            )}
            {restaurant.opening_hours && (
              <div className="restaurant-info-item">
                <span className="restaurant-info-label">영업시간:</span>
                <span className="restaurant-info-value">{restaurant.opening_hours}</span>
              </div>
            )}
            {restaurant.status && (
              <div className="restaurant-info-item">
                <span className="restaurant-info-label">상태:</span>
                <span className="restaurant-info-value">{restaurant.status}</span>
              </div>
            )}
            {restaurant.price_range && (
              <div className="restaurant-info-item">
                <span className="restaurant-info-label">가격대:</span>
                <span className="restaurant-info-value">{restaurant.price_range}</span>
              </div>
            )}
          </div>
          <div className="modal-actions">
            <a
              href={urls.naver}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              🗺️ 네이버지도에서 보기
            </a>
            <a
              href={urls.kakao}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
            >
              📍 카카오맵에서 보기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
