const BASE = "https://www.themealdb.com/api/json/v1/1";

async function request(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function getRandomMeal() {
  const data = await request("/random.php");
  return data.meals?.[0] ?? null;
}

export async function searchMealsByName(query) {
  const q = query.trim();
  if (!q) return [];
  const data = await request(`/search.php?s=${encodeURIComponent(q)}`);
  return data.meals ?? [];
}

export async function getMealById(id) {
  const data = await request(`/lookup.php?i=${encodeURIComponent(id)}`);
  return data.meals?.[0] ?? null;
}

export async function listAreas() {
  const data = await request("/list.php?a=list");
  return (data.meals ?? []).map((x) => x.strArea).filter(Boolean);
}

export async function listCategories() {
  const data = await request("/list.php?c=list");
  return (data.meals ?? []).map((x) => x.strCategory).filter(Boolean);
}

// Filters return only: idMeal, strMeal, strMealThumb
export async function filterMealsByArea(area) {
  const data = await request(`/filter.php?a=${encodeURIComponent(area)}`);
  return data.meals ?? [];
}

export async function filterMealsByCategory(category) {
  const data = await request(`/filter.php?c=${encodeURIComponent(category)}`);
  return data.meals ?? [];
}
