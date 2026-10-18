"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { UserRow } from "@/lib/admin";
import { formatDate } from "@/lib/dates";
import { pct, timeAgo } from "./AdminCharts";

const SORTS = {
  lastSeen: { label: "Last seen", by: (u: UserRow) => u.lastSeenAt?.getTime() ?? 0 },
  joined: { label: "Newest", by: (u: UserRow) => Date.parse(u.joined) },
  solved: { label: "Most solved", by: (u: UserRow) => u.solved },
  active: { label: "Most active", by: (u: UserRow) => u.active30 },
  hit: { label: "Hit rate", by: (u: UserRow) => u.hitRate ?? -1 },
} as const;

export function UsersTable({ users }: { users: UserRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<keyof typeof SORTS>("lastSeen");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((u) => !q || `${u.name} ${u.email} ${u.goal ?? ""} ${u.topPattern ?? ""}`.toLowerCase().includes(q))
      .sort((a, b) => SORTS[sort].by(b) - SORTS[sort].by(a));
  }, [users, query, sort]);

  const control = "rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-pulse";
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, goal, pattern" className={`${control} min-w-0 flex-1 basis-56`} />
        <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className={control} aria-label="Sort by">
          {Object.entries(SORTS).map(([k, s]) => (
            <option key={k} value={k}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="self-center text-xs text-muted">{rows.length} users</span>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[48rem] text-sm">
          <thead className="border-b border-line text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">User</th>
              <th className="px-3 py-2.5 font-medium">Last seen</th>
              <th className="px-3 py-2.5 text-right font-medium">Solved</th>
              <th className="px-3 py-2.5 text-right font-medium">Topics</th>
              <th className="px-3 py-2.5 text-right font-medium" title="Days active in the last 30">Active 30d</th>
              <th className="px-3 py-2.5 text-right font-medium" title="Days the full daily target was solved, of days with a plan">Hit rate</th>
              <th className="px-3 py-2.5 font-medium">Top pattern</th>
              <th className="px-4 py-2.5 font-medium">Goal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-panel-2/60">
                <td className="px-4 py-2.5">
                  <Link href={`/admin/users/${u.id}`} className="font-medium hover:text-pulse">
                    {u.name}
                  </Link>
                  <div className="text-xs text-muted">
                    {u.email} · joined {formatDate(u.joined, { day: "numeric", month: "short", year: "2-digit" })}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-xs text-muted">{timeAgo(u.lastSeenAt)}</td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums">{u.solved}</td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums">{u.topics}</td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums">{u.active30}</td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums">{pct(u.hitRate)}</td>
                <td className="px-3 py-2.5 text-xs text-muted">{u.topPattern ?? "—"}</td>
                <td className="max-w-56 truncate px-4 py-2.5 text-xs text-muted" title={u.goal ?? undefined}>
                  {u.goal ?? "—"}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted">
                  No users match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
