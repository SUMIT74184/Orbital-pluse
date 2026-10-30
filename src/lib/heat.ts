// Shared activity heatmap scale. Light blue for a little activity, deep blue for a lot. Level 0 is an empty cell.
export const HEAT_LEVELS = ["var(--color-panel-2)", "#bfdbfe", "#60a5fa", "#2563eb", "#1e40af"];
export const HEAT_LABELS = ["0", "1–2", "3–4", "5–7", "8+"];
export const heatLevel = (n: number) => (n === 0 ? 0 : n <= 2 ? 1 : n <= 4 ? 2 : n <= 7 ? 3 : 4);
