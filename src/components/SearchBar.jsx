import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { theme } from "../theme/theme";

export default function SearchBar({ query, onQueryChange, onSearch, isSearching }) {
  return (
    <View style={styles.row}>
      <TextInput
        value={query}
        onChangeText={onQueryChange}
        placeholder="Enter dish name (or leave empty and use filters)..."
        placeholderTextColor={theme.colors.muted}
        style={styles.input}
        returnKeyType="search"
        onSubmitEditing={onSearch}
      />
      <Pressable
        onPress={onSearch}
        disabled={isSearching}
        style={({ pressed }) => [
          styles.button,
          isSearching && { opacity: 0.7 },
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        <Text style={styles.buttonText}>{isSearching ? "Searching..." : "Search"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: theme.spacing(1),
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(1.25),
    color: theme.colors.textOnPanel,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  button: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(1.25),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonText: {
    color: theme.colors.textOnPanel,
    fontWeight: "600",
  },
});
