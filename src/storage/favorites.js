import AsyncStorage from "@react-native-async-storage/async-storage";

export const FAV_KEY = "themealdb:favorites";

export async function loadFavIds() {
  try {
    const raw = await AsyncStorage.getItem(FAV_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x !== null && x !== undefined && x !== "");
  } catch {
    return [];
  }
}

export async function saveFavIds(ids) {
  const cleaned = Array.isArray(ids)
    ? ids.filter((x) => x !== null && x !== undefined && x !== "")
    : [];
  await AsyncStorage.setItem(FAV_KEY, JSON.stringify(cleaned));
}
