export const colors = {
  n800: "#1F2937",
  n600: "#4B5563",
  n400: "#9CA3AF",
  n200: "#E5E7EB",
  n100: "#F3F4F6",
  g700: "#047857",
  g600: "#059669",
  g500: "#10B981",
  g200: "#A7F3D0",
  g100: "#D1FAE5",
  g50: "#ECFDF5",
  amber: "#F59E0B",
  red500: "#EF4444",
  white: "#FFFFFF",
} as const;

export type AppColor = keyof typeof colors;
