const COLORS = ["#4c9aff", "#2dd4a0", "#b18cff", "#ffb547", "#ff7eb6", "#22e584", "#5eead4"];

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

export function Avatar({ name, seed, size = 32 }: { name: string; seed: string; size?: number }) {
  const hash = [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const c = COLORS[hash % COLORS.length];
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        color: c,
        background: `${c}22`,
        boxShadow: `inset 0 0 0 1.5px ${c}66`,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
