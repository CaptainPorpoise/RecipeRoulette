export const theme = {
  colors: {
    bg: "#B5896F",        // warm cocoa
    panel: "#EAE3DA",     // soft cream
    accent: "#D8A08A",    // muted peach
    textOnBg: "#EEE5DC",
    textOnPanel: "#3A2A24",
    muted: "#6B6B6B",
    border: "rgba(0,0,0,0.08)",
    white: "#FFFFFF",
    danger: "#8A2D2D",
  },
  radius: { sm: 10, md: 14, lg: 18 },
  spacing: (n: number) => n * 8,
  shadow: {
    card: {
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    } as const,
  },
};
