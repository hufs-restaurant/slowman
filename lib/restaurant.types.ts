export type CampusKey = "seoul" | "global";

export interface Restaurant {
  name: string;
  category: string;
  /** 주소 */
  address?: string | null;
  /** 전화번호 */
  phone?: string | null;
  /** 평점 0–5 */
  rating?: number | null;
  /** 리뷰 수 */
  review_count?: number | null;
  /** 가격대 */
  price_range?: string | null;
  /** 영업시간 */
  opening_hours?: string | null;
  /** 영업중 | 폐업 | 정보없음 */
  status?: string | null;
  /** 마지막 업데이트 ISO 문자열 */
  last_updated?: string | null;
}

export interface CampusData {
  campus: string;
  restaurants: Restaurant[];
}

export interface RestaurantsData {
  seoul: CampusData;
  global: CampusData;
}

export interface RestaurantWithCampus extends Restaurant {
  campus: CampusKey;
}
