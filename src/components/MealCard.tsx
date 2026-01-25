import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme/theme";
import type { MealLite } from "../types/meal";

type Props = {
  meal: MealLite;
  onOpen: (id: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  compact?: boolean;
};

export default function MealCard({
  meal,
  onOpen,
  isFavorite,
  onToggleFavorite,
  compact,
}: Props) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Pressable
        onPress={() => onOpen(meal.idMeal)}
        style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.99 }] }]}
      >
        <Image source={{ uri: meal.strMealThumb }} style={styles.img} resizeMode="cover" />
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={2}>
            {meal.strMeal}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta} numberOfLines={1}>
              {meal.strArea || "-"}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {meal.strCategory || "-"}
            </Text>
          </View>
        </View>
      </Pressable>

      <Pressable
        onPress={() => onToggleFavorite(meal.idMeal)}
        style={({ pressed }) => [styles.favBtn, pressed && { transform: [{ scale: 0.95 }] }]}
        hitSlop={10}
      >
        <Text style={styles.favText}>{isFavorite ? "★" : "☆"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    position: "relative",
    marginBottom: theme.spacing(1.25),
  },
  wrapCompact: {
    maxWidth: 240,
    minWidth: 220,
    marginRight: theme.spacing(1.25),
  },
  card: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  img: {
    width: "100%",
    height: 120,
  },
  body: {
    padding: theme.spacing(1.25),
  },
  title: {
    color: theme.colors.textOnPanel,
    fontWeight: "700",
    fontSize: 14,
    marginBottom: theme.spacing(0.5),
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing(1),
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 12,
    flex: 1,
  },
  favBtn: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 999,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  favText: {
    fontSize: 18,
    color: theme.colors.textOnPanel,
    marginTop: -1,
  },
});
