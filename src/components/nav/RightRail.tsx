"use client";

import { useState } from "react";
import { Icon, type IconName } from "./Icons";
import { RAIL_COOKIE, YEAR } from "./cookies";

const PEEK: { icon: IconName; label: string; color: string }[] = [
  { icon: "focus", label: "Today's focus", color: "var(--color-new)" },
  { icon: "flame", label: "Streak & progress", color: "var(--color-topic)" },
  { icon: "flag", label: "Goal & reminders", color: "var(--color-pulse)" },
  { icon: "zap", label: "Quick actions", color: "var(--color-rev)" },
];

/** Right-hand panel on wide screens. Collapses to a thin strip; the choice is remembered in a cookie. */
export function RightRail({ initialCollapsed, children }: { initialCollapsed: boolean; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${RAIL_COOKIE}=${next ? "collapsed" : "open"}; path=/; max-age=${YEAR}; samesite=lax`;
  }

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-l border-line bg-panel/80 backdrop-blur transition-[width] duration-200 xl:flex ${
        collapsed ? "w-14" : "w-72"
      }`}
      aria-label="At a glance"
    >
      <div className={`flex h-14 shrink-0 items-center border-b border-line ${collapsed ? "justify-center" : "justify-between pl-4 pr-2"}`}>
        {!collapsed && <span className="font-mono text-[11px] uppercase tracking-widest text-muted">At a glance</span>}
        <button
          onClick={toggle}
          title={collapsed ? "Show panel" : "Hide panel"}
          aria-label={collapsed ? "Show panel" : "Hide panel"}
          className="rounded-lg p-2 text-muted hover:bg-panel-2 hover:text-ink"
        >
          <Icon name={collapsed ? "railOpen" : "railClose"} />
        </button>
      </div>
      {collapsed ? (
        <div className="flex flex-col items-center gap-1 py-4">
          {PEEK.map((p) => (
            <button key={p.label} onClick={toggle} title={p.label} aria-label={`Show ${p.label}`} className="rounded-lg p-2.5 hover:bg-panel-2">
              <Icon name={p.icon} style={{ color: p.color }} />
            </button>
          ))}
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      )}
    </aside>
  );
}
