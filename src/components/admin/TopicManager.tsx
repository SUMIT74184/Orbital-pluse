"use client";

import { EditableRow, TopicControls, TopicForm, type TopicValues } from "./ContentForms";

type Row = TopicValues & { id: number; archived: boolean; users: number };

export function TopicManager({ track, topics, sections }: { track: string; topics: Row[]; sections: string[] }) {
  const live = topics.filter((t) => !t.archived);
  const archived = topics.filter((t) => t.archived);
  const row = (t: Row, i: number, list: Row[]) => (
    <EditableRow
      key={t.id}
      summary={
        <>
          <p className={`text-sm font-medium ${t.archived ? "text-muted line-through" : ""}`}>
            <span className="mr-2 font-mono text-xs text-muted">{t.archived ? "–" : i + 1}.</span>
            {t.title}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {t.section} · done by {t.users}
            {t.points.length > 0 && ` · ${t.points.join(" · ")}`}
          </p>
        </>
      }
      actions={<TopicControls track={track} id={t.id} archived={t.archived} first={t.archived || i === 0} last={t.archived || i === list.length - 1} />}
      form={(close) => <TopicForm track={track} sections={sections} initial={t} onDone={close} />}
    />
  );
  return (
    <div className="space-y-4">
      <div className="card divide-y divide-line overflow-hidden">
        {live.map(row)}
        {!live.length && <p className="px-4 py-10 text-center text-sm text-muted">No topics yet. Add the first one above.</p>}
      </div>
      {archived.length > 0 && (
        <details className="card overflow-hidden">
          <summary className="cursor-pointer px-4 py-3 text-sm text-muted hover:bg-panel-2">Archived ({archived.length})</summary>
          <div className="divide-y divide-line border-t border-line">{archived.map(row)}</div>
        </details>
      )}
    </div>
  );
}
