export type CampusKey = "seoul" | "global";

export interface Restaurant {
  name: string;
  category: string;
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
