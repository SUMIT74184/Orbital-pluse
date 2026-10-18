import "server-only";
import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import { connectDB } from "./db";
import { Meta, QuestionModel, Track, TrackTopic } from "./models";
import { SEED_QUESTIONS, type Difficulty, type Question } from "@/data/catalog";
import { SEED_TRACKS, type Topic } from "@/data/topics";

export const CATALOG_TAG = "catalog";

export type CatalogQuestion = Question & { archived: boolean };
export type CatalogTopic = Topic & { order: number; archived: boolean };
export type CatalogTrack = {
  key: string;
  name: string;
  description: string;
  defaultOn: boolean;
  archived: boolean;
  /** Live topics in the order users get them. */
  topics: CatalogTopic[];
  /** Live and archived topics, for looking up past progress. */
  allTopics: CatalogTopic[];
};

/** The small slice of the catalog client components need: pattern names in sheet order and their question counts. */
export type CatalogMeta = { groups: string[]; counts: Record<string, number> };

/** First run: copy the questions and tracks in src/data into the database. Upserts, so concurrent runs are harmless. */
async function ensureSeeded() {
  if (await Meta.exists({ _id: "catalog-seeded" })) return;
  await QuestionModel.bulkWrite(
    SEED_QUESTIONS.map(({ id, ...q }) => ({
      updateOne: { filter: { qid: id }, update: { $setOnInsert: { ...q, qid: id, archived: false } }, upsert: true },
    })),
  );
  await Track.bulkWrite(
    SEED_TRACKS.map((t, i) => ({
      updateOne: {
        filter: { key: t.key },
        update: { $setOnInsert: { key: t.key, name: t.name, description: t.description, order: i, defaultOn: true, archived: false } },
        upsert: true,
      },
    })),
  );
  await TrackTopic.bulkWrite(
    SEED_TRACKS.flatMap((t) =>
      t.topics.map(({ id, ...topic }) => ({
        updateOne: {
          filter: { track: t.key, topicId: id },
          update: { $setOnInsert: { ...topic, practice: topic.practice ?? [], track: t.key, topicId: id, order: id, archived: false } },
          upsert: true,
        },
      })),
    ),
  );
  await Meta.updateOne({ _id: "catalog-seeded" }, { $set: { at: new Date() } }, { upsert: true });
}

// Shared across requests (and instances, on Vercel) until an admin edit calls invalidateCatalog().
const loadCatalog = unstable_cache(
  async () => {
    await connectDB();
    await ensureSeeded();
    const [questions, tracks, topics] = await Promise.all([
      QuestionModel.find({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).sort({ qid: 1 }).lean(),
      Track.find({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).sort({ order: 1, key: 1 }).lean(),
      TrackTopic.find({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).sort({ order: 1, topicId: 1 }).lean(),
    ]);
    return { questions, tracks, topics };
  },
  ["catalog-v1"],
  { tags: [CATALOG_TAG] },
);

export const getCatalog = cache(async () => {
  const raw = await loadCatalog();
  const all: CatalogQuestion[] = raw.questions.map(({ qid, ...q }) => ({ ...q, id: qid, companies: q.companies ?? [] }));
  const questions = all.filter((q) => !q.archived);
  const groups = [...new Set(questions.map((q) => q.group))];
  const counts: Record<string, number> = {};
  const diffTotals: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
  for (const q of questions) {
    counts[q.group] = (counts[q.group] ?? 0) + 1;
    diffTotals[q.difficulty]++;
  }

  const allTracks: CatalogTrack[] = raw.tracks.map((t) => {
    const allTopics = raw.topics
      .filter((x) => x.track === t.key)
      .map(({ topicId, ...x }) => ({ ...x, id: topicId, practice: x.practice?.length ? x.practice : undefined }));
    return {
      key: t.key,
      name: t.name,
      description: t.description ?? "",
      defaultOn: t.defaultOn,
      archived: t.archived,
      allTopics,
      topics: allTopics.filter((x) => !x.archived),
    };
  });

  return {
    /** Live questions, by id. */
    questions,
    /** Every question including archived ones, so past progress still resolves. */
    byId: new Map(all.map((q) => [q.id, q])),
    groups,
    counts,
    diffTotals,
    /** Live tracks in display order. */
    tracks: allTracks.filter((t) => !t.archived),
    allTracks,
    trackByKey: new Map(allTracks.map((t) => [t.key, t])),
    meta: { groups, counts } satisfies CatalogMeta,
  };
});

export type Catalog = Awaited<ReturnType<typeof getCatalog>>;

export function invalidateCatalog() {
  revalidateTag(CATALOG_TAG, { expire: 0 });
}

/** Whether a user gets this track's daily topic: their own choice, else the track's default. */
export function trackOn(prefs: Record<string, boolean>, track: Pick<CatalogTrack, "key" | "defaultOn">) {
  return prefs[track.key] ?? track.defaultOn;
}
