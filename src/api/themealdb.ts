import type { MealDetails, MealLite } from "../types/meal";

const BASE = "https://www.themealdb.com/api/json/v1/1";

async function request<T>(path: string): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

export async function getRandomMeal(): Promise<MealDetails | null> {
  const data = await request<{ meals: MealDetails[] | null }>("/random.php");
  return data.meals?.[0] ?? null;
}

export async function searchMealsByName(query: string): Promise<MealDetails[]> {
  const q = query.trim();
  if (!q) return [];
  const data = await request<{ meals: MealDetails[] | null }>(
    `/search.php?s=${encodeURIComponent(q)}`
  );
  return data.meals ?? [];
}

export async function getMealById(id: string): Promise<MealDetails | null> {
  const data = await request<{ meals: MealDetails[] | null }>(
    `/lookup.php?i=${encodeURIComponent(id)}`
  );
  return data.meals?.[0] ?? null;
}

export async function listAreas(): Promise<string[]> {
  const data = await request<{ meals: { strArea: string }[] | null }>("/list.php?a=list");
  return (data.meals ?? []).map((x) => x.strArea).filter(Boolean);
}

export async function listCategories(): Promise<string[]> {
  const data = await request<{ meals: { strCategory: string }[] | null }>("/list.php?c=list");
  return (data.meals ?? []).map((x) => x.strCategory).filter(Boolean);
}

export async function filterMealsByArea(area: string): Promise<MealLite[]> {
  const data = await request<{ meals: MealLite[] | null }>(
    `/filter.php?a=${encodeURIComponent(area)}`
  );
  return data.meals ?? [];
}

export async function filterMealsByCategory(category: string): Promise<MealLite[]> {
  const data = await request<{ meals: MealLite[] | null }>(
    `/filter.php?c=${encodeURIComponent(category)}`
  );
  return data.meals ?? [];
}
