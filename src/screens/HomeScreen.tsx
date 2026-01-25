import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import MealCard from "../components/MealCard";
import MealModal from "../components/MealModal";
import SearchBar from "../components/SearchBar";
import { theme } from "../theme/theme";

import {
    filterMealsByArea,
    filterMealsByCategory,
    getMealById,
    getRandomMeal,
    listAreas,
    listCategories,
    searchMealsByName,
} from "../api/themealdb";
import type { MealDetails, MealLite } from "../types/meal";

import { loadFavIds, saveFavIds } from "../storage/favorites";

const FILTER_RESULTS_LIMIT = 24;

function intersectById(listA: MealLite[], listB: MealLite[]) {
  const setB = new Set(listB.map((x) => x.idMeal));
  return listA.filter((x) => setB.has(x.idMeal));
}
function uniqById(list: MealLite[]) {
  const seen = new Set<string>();
  const out: MealLite[] = [];
  for (const x of list) {
    if (!seen.has(x.idMeal)) {
      seen.add(x.idMeal);
      out.push(x);
    }
  }
  return out;
}

export default function HomeScreen() {
  const [randomMeal, setRandomMeal] = useState<MealDetails | null>(null);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [randomError, setRandomError] = useState("");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MealDetails[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [areas, setAreas] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [filtersError, setFiltersError] = useState("");

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteMeals, setFavoriteMeals] = useState<MealDetails[]>([]);
  const [loadingFavs, setLoadingFavs] = useState(false);
  const [favsError, setFavsError] = useState("");

  const [favoritesCollapsed, setFavoritesCollapsed] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealDetails | null>(null);
  const [loadingMeal, setLoadingMeal] = useState(false);
  const [mealError, setMealError] = useState("");

  const favSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  async function loadRandom() {
    setLoadingRandom(true);
    setRandomError("");
    try {
      const meal = await getRandomMeal();
      setRandomMeal(meal);
    } catch (err: any) {
      setRandomError(`Failed to fetch random recipe: ${err?.message || String(err)}`);
    } finally {
      setLoadingRandom(false);
    }
  }

  async function loadFilters() {
    setFiltersError("");
    try {
      const [a, c] = await Promise.all([listAreas(), listCategories()]);
      setAreas(a);
      setCategories(c);
    } catch (err: any) {
      setFiltersError(`Failed to fetch filter lists: ${err?.message || String(err)}`);
    }
  }

  async function loadFavoritesDetails(ids: string[]) {
    setLoadingFavs(true);
    setFavsError("");
    try {
      const validIds = (Array.isArray(ids) ? ids : []).filter((x) => x && String(x).trim());

      if (validIds.length === 0) {
        setFavoriteMeals([]);
        return;
      }

      const settled = await Promise.allSettled(validIds.map((id) => getMealById(id)));
      const meals = settled
        .map((r) => (r.status === "fulfilled" ? r.value : null))
        .filter(Boolean) as MealDetails[];

      setFavoriteMeals(meals);
      if (meals.length === 0) setFavsError("Failed to fetch favorites details.");
    } catch (err: any) {
      setFavsError(`Failed to fetch favorites details: ${err?.message || String(err)}`);
      setFavoriteMeals([]);
    } finally {
      setLoadingFavs(false);
    }
  }

  async function doSearch() {
    const q = query.trim();
    setLoadingSearch(true);
    setSearchError("");

    try {
      if (q) {
        const meals = await searchMealsByName(q);
        setResults(meals);
        if (meals.length === 0) setSearchError("No results for the given query.");
        return;
      }

      const areaActive = selectedArea !== "ALL";
      const categoryActive = selectedCategory !== "ALL";

      if (!areaActive && !categoryActive) {
        setResults([]);
        setSearchError("Enter a phrase or select cuisine/category from filters.");
        return;
      }

      let filteredLite: MealLite[] = [];

      if (areaActive && categoryActive) {
        const [byArea, byCat] = await Promise.all([
          filterMealsByArea(selectedArea),
          filterMealsByCategory(selectedCategory),
        ]);
        filteredLite = intersectById(byArea, byCat);
      } else if (areaActive) {
        filteredLite = await filterMealsByArea(selectedArea);
      } else if (categoryActive) {
        filteredLite = await filterMealsByCategory(selectedCategory);
      }

      filteredLite = uniqById(filteredLite);

      if (filteredLite.length === 0) {
        setResults([]);
        setSearchError("No results for selected filters.");
        return;
      }

      const limited = filteredLite.slice(0, FILTER_RESULTS_LIMIT);
      const detailed = await Promise.all(limited.map((m) => getMealById(m.idMeal)));
      const mealsFull = detailed.filter(Boolean) as MealDetails[];

      setResults(mealsFull);

      if (filteredLite.length > FILTER_RESULTS_LIMIT) {
        setSearchError(
          `Found ${filteredLite.length} results. Showing first ${FILTER_RESULTS_LIMIT} (for performance).`
        );
      }
    } catch (err: any) {
      setSearchError(`Failed to fetch results from the API: ${err?.message || String(err)}`);
      setResults([]);
    } finally {
      setLoadingSearch(false);
    }
  }

  async function openMeal(id: string) {
    setModalOpen(true);
    setSelectedMeal(null);
    setLoadingMeal(true);
    setMealError("");

    try {
      const meal = await getMealById(id);
      if (!meal) setMealError("Recipe details not found.");
      else setSelectedMeal(meal);
    } catch (err: any) {
      setMealError(`Failed to fetch recipe details: ${err?.message || String(err)}`);
    } finally {
      setLoadingMeal(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
  }

  function toggleFavorite(id: string) {
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      saveFavIds(next).catch(() => {});
      return next;
    });
  }

  useEffect(() => {
    loadRandom();
    loadFilters();
    loadFavIds().then(setFavoriteIds).catch(() => setFavoriteIds([]));
  }, []);

  useEffect(() => {
    loadFavoritesDetails(favoriteIds);
  }, [favoriteIds]);

  useEffect(() => {
    const q = query.trim();
    const areaActive = selectedArea !== "ALL";
    const categoryActive = selectedCategory !== "ALL";
    if (!q && (areaActive || categoryActive)) doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArea, selectedCategory]);

  const filteredResults = useMemo(() => {
    const q = query.trim();
    if (!q) return results;

    let list = results;
    if (selectedArea !== "ALL") {
      list = list.filter((m) => (m.strArea || "").toLowerCase() === selectedArea.toLowerCase());
    }
    if (selectedCategory !== "ALL") {
      list = list.filter(
        (m) => (m.strCategory || "").toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    return list;
  }, [results, selectedArea, selectedCategory, query]);

  const filtersActive = selectedArea !== "ALL" || selectedCategory !== "ALL";
  const resultsEmptyAfterFilter =
    query.trim().length > 0 && results.length > 0 && filteredResults.length === 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Recipe Roulette</Text>
          <Text style={styles.tagline}>Random recipe everyday</Text>
        </View>

        {!!randomError && <Text style={styles.alert}>Error: {randomError}</Text>}

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Random recipe</Text>

          {loadingRandom && (
            <View style={styles.loadingRow}>
              <ActivityIndicator />
              <Text style={styles.hint}>Fetching random recipe…</Text>
            </View>
          )}

          {!loadingRandom && !!randomMeal && (
            <View style={styles.randomRow}>
              <Image source={{ uri: randomMeal.strMealThumb }} style={styles.randomImg} />
              <View style={{ flex: 1 }}>
                <View style={styles.randomTitleRow}>
                  <Text style={styles.randomTitle} numberOfLines={2}>
                    {randomMeal.strMeal}
                  </Text>

                  <Pressable onPress={() => toggleFavorite(randomMeal.idMeal)} style={styles.inlineFav}>
                    <Text style={styles.inlineFavText}>
                      {favSet.has(randomMeal.idMeal) ? "★" : "☆"}
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.metaLine}>
                  <Text style={styles.metaStrong}>Cuisine:</Text> {randomMeal.strArea || "-"}{"   "}
                  <Text style={styles.metaStrong}>Category:</Text> {randomMeal.strCategory || "-"}
                </Text>

                <View style={styles.actionsRow}>
                  <Pressable onPress={() => openMeal(randomMeal.idMeal)} style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>View details</Text>
                  </Pressable>

                  <Pressable onPress={loadRandom} style={styles.primaryBtn} disabled={loadingRandom}>
                    <Text style={styles.primaryBtnText}>
                      {loadingRandom ? "Loading..." : "Random recipe"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeaderRow}>
            <Text style={styles.panelTitle}>Favorites</Text>
            <Pressable onPress={() => setFavoritesCollapsed((s) => !s)} style={styles.ghostBtn}>
              <Text style={styles.ghostBtnText}>{favoritesCollapsed ? "Expand" : "Collapse"}</Text>
            </Pressable>
          </View>

          {favoriteIds.length === 0 && (
            <Text style={styles.hint}>
              You don't have any favorites yet. Add with the star on the card or in details.
            </Text>
          )}

          {!!favsError && <Text style={styles.alert}>Error: {favsError}</Text>}

          {loadingFavs && (
            <View style={styles.loadingRow}>
              <ActivityIndicator />
              <Text style={styles.hint}>Loading favorites…</Text>
            </View>
          )}

          {favoriteMeals.length > 0 && favoritesCollapsed && (
            <FlatList
              data={favoriteMeals}
              horizontal
              key={"favH"}
              keyExtractor={(m) => String(m.idMeal)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: theme.spacing(1) }}
              renderItem={({ item }) => (
                <MealCard
                  meal={item}
                  onOpen={openMeal}
                  isFavorite={favSet.has(item.idMeal)}
                  onToggleFavorite={toggleFavorite}
                  compact
                />
              )}
            />
          )}

          {favoriteMeals.length > 0 && !favoritesCollapsed && (
            <FlatList
              data={favoriteMeals}
              key={"favG"}
              numColumns={2}
              scrollEnabled={false}
              keyExtractor={(m) => String(m.idMeal)}
              columnWrapperStyle={{ gap: theme.spacing(1.25) }}
              contentContainerStyle={{ paddingTop: theme.spacing(1) }}
              renderItem={({ item }) => (
                <View style={{ flex: 1 }}>
                  <MealCard
                    meal={item}
                    onOpen={openMeal}
                    isFavorite={favSet.has(item.idMeal)}
                    onToggleFavorite={toggleFavorite}
                  />
                </View>
              )}
            />
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Search</Text>

          <SearchBar
            query={query}
            onQueryChange={(v) => {
              setQuery(v);
              if (!v.trim()) {
                setResults([]);
                setSearchError("");
              }
            }}
            onSearch={doSearch}
            isSearching={loadingSearch}
          />

          <View style={styles.filters}>
            <View style={styles.filterBox}>
              <Text style={styles.filterLabel}>Cuisine</Text>
              <View style={styles.pickerWrap}>
                <Picker selectedValue={selectedArea} onValueChange={(v) => setSelectedArea(String(v))}>
                  <Picker.Item label="All" value="ALL" />
                  {areas.map((a) => (
                    <Picker.Item key={a} label={a} value={a} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterBox}>
              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={selectedCategory}
                  onValueChange={(v) => setSelectedCategory(String(v))}
                >
                  <Picker.Item label="All" value="ALL" />
                  {categories.map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                </Picker>
              </View>
            </View>

            <Pressable
              onPress={() => {
                setSelectedArea("ALL");
                setSelectedCategory("ALL");
              }}
              disabled={!filtersActive}
              style={[styles.ghostBtn, !filtersActive && { opacity: 0.6 }]}
            >
              <Text style={styles.ghostBtnText}>Clear filters</Text>
            </Pressable>
          </View>

          {!!filtersError && <Text style={styles.hint}>{filtersError}</Text>}
          {!!searchError && <Text style={styles.hint}>{searchError}</Text>}

          {loadingSearch && (
            <View style={styles.loadingRow}>
              <ActivityIndicator />
              <Text style={styles.hint}>Searching recipes…</Text>
            </View>
          )}

          {resultsEmptyAfterFilter && (
            <Text style={styles.hint}>
              There are search results, but none match the selected filters. Change filters.
            </Text>
          )}

          {filteredResults.length > 0 && (
            <FlatList
              data={filteredResults}
              numColumns={2}
              scrollEnabled={false}
              keyExtractor={(m) => String(m.idMeal)}
              columnWrapperStyle={{ gap: theme.spacing(1.25) }}
              contentContainerStyle={{ paddingTop: theme.spacing(1) }}
              renderItem={({ item }) => (
                <View style={{ flex: 1 }}>
                  <MealCard
                    meal={item}
                    onOpen={openMeal}
                    isFavorite={favSet.has(item.idMeal)}
                    onToggleFavorite={toggleFavorite}
                  />
                </View>
              )}
            />
          )}
        </View>

        <Text style={styles.footer}>Data: TheMealDB API. Recipe Roulette.</Text>

        <MealModal
          isOpen={modalOpen}
          onClose={closeModal}
          meal={selectedMeal}
          isLoading={loadingMeal}
          error={mealError}
          isFavorite={selectedMeal?.idMeal ? favSet.has(selectedMeal.idMeal) : false}
          onToggleFavorite={toggleFavorite}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  page: {
    paddingHorizontal: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    gap: theme.spacing(2),
  },
  header: { alignItems: "center", marginBottom: theme.spacing(0.5) },
  title: { color: theme.colors.textOnBg, fontWeight: "900", fontSize: 28, letterSpacing: 0.2 },
  tagline: { color: theme.colors.textOnBg, opacity: 0.85, marginTop: theme.spacing(0.5) },

  panel: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  panelTitle: { color: theme.colors.textOnPanel, fontWeight: "900", fontSize: 16, marginBottom: theme.spacing(1.25) },
  panelHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing(0.75) },

  alert: { color: theme.colors.danger, fontWeight: "700", marginBottom: theme.spacing(1) },
  hint: { color: theme.colors.muted, marginTop: theme.spacing(0.75) },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing(1) },

  randomRow: { flexDirection: "row", gap: theme.spacing(1.5), alignItems: "center" },
  randomImg: { width: 92, height: 92, borderRadius: theme.radius.md, backgroundColor: "#DDD" },
  randomTitleRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing(1) },
  randomTitle: { flex: 1, color: theme.colors.textOnPanel, fontWeight: "900", fontSize: 16 },
  inlineFav: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inlineFavText: { fontSize: 18, color: theme.colors.textOnPanel, marginTop: -1 },
  metaLine: { color: theme.colors.textOnPanel, opacity: 0.9, marginTop: theme.spacing(0.5) },
  metaStrong: { fontWeight: "900" },

  actionsRow: { flexDirection: "row", gap: theme.spacing(1), marginTop: theme.spacing(1.25), flexWrap: "wrap" },
  actionBtn: {
    backgroundColor: "rgba(255,255,255,0.85)",
    paddingHorizontal: theme.spacing(1.25),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionBtnText: { color: theme.colors.textOnPanel, fontWeight: "700" },
  primaryBtn: {
    backgroundColor: "rgba(216,160,138,0.35)",
    paddingHorizontal: theme.spacing(1.25),
    paddingVertical: theme.spacing(1),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  primaryBtnText: { color: theme.colors.textOnPanel, fontWeight: "900" },

  ghostBtn: {
    backgroundColor: "rgba(255,255,255,0.75)",
    paddingHorizontal: theme.spacing(1.25),
    paddingVertical: theme.spacing(0.9),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghostBtnText: { color: theme.colors.textOnPanel, fontWeight: "800" },

  filters: { marginTop: theme.spacing(1.5), gap: theme.spacing(1.25) },
  filterBox: { gap: theme.spacing(0.5) },
  filterLabel: { color: theme.colors.textOnPanel, fontWeight: "800" },
  pickerWrap: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },

  footer: { textAlign: "center", color: theme.colors.textOnBg, opacity: 0.9, marginTop: theme.spacing(1) },
});
