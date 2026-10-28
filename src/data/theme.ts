// Colour themes a user can pick in Settings. "system" follows the device's own light / dark setting.
export const THEMES = ["dark", "light", "system"] as const;
export type Theme = (typeof THEMES)[number];

export const parseTheme = (v: unknown): Theme => (THEMES.includes(v as Theme) ? (v as Theme) : "dark");
