import { readFile } from "fs/promises";
import path from "path";
import type { RestaurantsData } from "./restaurant.types";

export async function getRestaurants(): Promise<RestaurantsData> {
  const filePath = path.join(process.cwd(), "data", "restaurants.json");
  const content = await readFile(filePath, "utf-8");
  return JSON.parse(content);
}
