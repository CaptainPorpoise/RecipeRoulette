import AsyncStorage from "@react-native-async-storage/async-storage";

export const FAV_KEY = "themealdb:favorites";

export async function loadFavIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAV_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(String)
      .map((x) => x.trim())
      .filter((x) => x.length > 0);
  } catch {
    return [];
  }
}

export async function saveFavIds(ids: string[]): Promise<void> {
  const cleaned = (Array.isArray(ids) ? ids : [])
    .map(String)
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
  await AsyncStorage.setItem(FAV_KEY, JSON.stringify(cleaned));
}
