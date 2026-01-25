import React, { useMemo } from "react";
import {
    Image,
    Linking,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { theme } from "../theme/theme";
import type { MealDetails } from "../types/meal";

function extractIngredients(meal: MealDetails): string[] {
  const items: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal?.[`strIngredient${i}`];
    const mea = meal?.[`strMeasure${i}`];
    if (ing && String(ing).trim()) {
      const line = `${(mea || "").trim()} ${String(ing).trim()}`.trim();
      items.push(line);
    }
  }
  return items;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  meal: MealDetails | null;
  isLoading: boolean;
  error: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export default function MealModal({
  isOpen,
  onClose,
  meal,
  isLoading,
  error,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const ingredients = useMemo(() => (meal ? extractIngredients(meal) : []), [meal]);

  // Fix for TS: narrow optional strings to definite string before passing into Linking.openURL
  const youtubeUrl = meal?.strYoutube;
  const sourceUrl = meal?.strSource;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {isLoading ? "Loading..." : meal?.strMeal ?? "Details"}
            </Text>

            <View style={styles.headerActions}>
              <Pressable
                style={styles.iconBtn}
                onPress={() => meal?.idMeal && !isLoading && onToggleFavorite(meal.idMeal)}
                disabled={!meal?.idMeal || isLoading}
              >
                <Text style={styles.iconText}>{isFavorite ? "★" : "☆"}</Text>
              </Pressable>

              <Pressable style={styles.iconBtn} onPress={onClose}>
                <Text style={styles.iconText}>✕</Text>
              </Pressable>
            </View>
          </View>

          {!!error && (
            <View style={styles.alert}>
              <Text style={styles.alertText}>Error: {error}</Text>
            </View>
          )}

          {isLoading && (
            <View style={styles.skeleton}>
              <Text style={styles.skeletonText}>Fetching recipe data…</Text>
            </View>
          )}

          {!isLoading && !!meal && (
            <ScrollView
              style={styles.content}
              contentContainerStyle={{ paddingBottom: theme.spacing(2) }}
            >
              <View style={styles.top}>
                <Image source={{ uri: meal.strMealThumb }} style={styles.modalImg} />
                <View style={styles.meta}>
                  <Text style={styles.metaLine}>
                    <Text style={styles.metaStrong}>Cuisine:</Text> {meal.strArea || "-"}
                  </Text>
                  <Text style={styles.metaLine}>
                    <Text style={styles.metaStrong}>Category:</Text> {meal.strCategory || "-"}
                  </Text>

                  {typeof youtubeUrl === "string" && youtubeUrl.trim().length > 0 && (
                    <Pressable onPress={() => Linking.openURL(youtubeUrl)} style={styles.linkBtn}>
                      <Text style={styles.linkText}>Open YouTube</Text>
                    </Pressable>
                  )}

                  {typeof sourceUrl === "string" && sourceUrl.trim().length > 0 && (
                    <Pressable onPress={() => Linking.openURL(sourceUrl)} style={styles.linkBtn}>
                      <Text style={styles.linkText}>Open source link</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                {ingredients.map((x) => (
                  <Text key={x} style={styles.listItem}>
                    • {x}
                  </Text>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instructions</Text>
                <Text style={styles.instructions}>{meal.strInstructions || "-"}</Text>
              </View>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: theme.spacing(2),
    justifyContent: "center",
  },
  modal: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(1.25),
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1),
  },
  headerTitle: {
    color: theme.colors.textOnPanel,
    fontWeight: "800",
    fontSize: 16,
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: theme.spacing(1),
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconText: {
    fontSize: 16,
    color: theme.colors.textOnPanel,
  },
  alert: {
    padding: theme.spacing(1.25),
    backgroundColor: "rgba(138,45,45,0.08)",
  },
  alertText: {
    color: theme.colors.danger,
    fontWeight: "600",
  },
  skeleton: { padding: theme.spacing(2) },
  skeletonText: { color: theme.colors.muted },
  content: { paddingHorizontal: theme.spacing(1.5), paddingTop: theme.spacing(1.5) },
  top: { flexDirection: "row", gap: theme.spacing(1.25) },
  modalImg: {
    width: 120,
    height: 120,
    borderRadius: theme.radius.md,
    backgroundColor: "#DDD",
  },
  meta: { flex: 1, gap: theme.spacing(0.75) },
  metaLine: { color: theme.colors.textOnPanel },
  metaStrong: { fontWeight: "800" },
  linkBtn: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(216,160,138,0.25)",
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing(1),
    paddingVertical: theme.spacing(0.75),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  linkText: { color: theme.colors.textOnPanel, fontWeight: "700" },
  section: { marginTop: theme.spacing(2) },
  sectionTitle: {
    color: theme.colors.textOnPanel,
    fontWeight: "900",
    fontSize: 15,
    marginBottom: theme.spacing(1),
  },
  listItem: { color: theme.colors.textOnPanel, marginBottom: theme.spacing(0.5) },
  instructions: { color: theme.colors.textOnPanel, lineHeight: 20 },
});
