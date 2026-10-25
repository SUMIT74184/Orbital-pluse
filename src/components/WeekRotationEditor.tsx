"use client";

import { useOptimistic, useState, useTransition } from "react";
import { moveTopic } from "@/data/catalog";
import { moveScheduleTopic } from "@/app/actions/settings";
import type { CatalogMeta } from "@/lib/catalog";
import { WeekRotation, type DragHandlers } from "./WeekRotation";

type Props = {
  schedule: string[][];
  meta: CatalogMeta;
  today?: number;
  solvedByGroup?: Record<string, number>;
};

/** WeekRotation whose topic chips can be dragged (or tapped, then a day tapped) onto another day. */
export function WeekRotationEditor({ onMove, ...props }: Props & { onMove: (group: string, from: number, to: number) => void }) {
  const [active, setActive] = useState<DragHandlers["active"]>(null);
  const [over, setOver] = useState<number | null>(null);

  const end = () => {
    setActive(null);
    setOver(null);
  };
  const drag: DragHandlers = {
    active,
    over,
    start: (group, from) => setActive({ group, from }),
    end,
    enter: setOver,
    drop: (day) => {
      if (active) onMove(active.group, active.from, day);
      end();
    },
  };
  return <WeekRotation {...props} drag={drag} />;
}

/** Saves each move right away (Revision plan page), showing it optimistically while the save runs. */
export function LiveWeekRotation(props: Props) {
  const [schedule, apply] = useOptimistic(props.schedule, (s, m: { group: string; from: number; to: number }) =>
    moveTopic(s, m.group, m.from, m.to, props.meta.groups),
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onMove = (group: string, from: number, to: number) =>
    startTransition(async () => {
      apply({ group, from, to });
      const res = await moveScheduleTopic(group, from, to);
      setError(res.error ?? null);
    });

  return (
    <>
      <WeekRotationEditor {...props} schedule={schedule} onMove={onMove} />
      <p className={`mt-2 text-xs ${error ? "text-hard" : "text-muted"}`} aria-live="polite">
        {error ?? (pending ? "Saving…" : "Drag a topic onto another day to move it, or tap a topic and then tap a day.")}
      </p>
    </>
  );
}
