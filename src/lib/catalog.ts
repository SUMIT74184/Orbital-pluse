import "server-only";
import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import { connectDB } from "./db";
import { Meta, QuestionModel, Track, TrackTopic } from "./models";
import { SEED_QUESTIONS, type Difficulty, type Question } from "@/data/catalog";
import { LEVELS, SEED_TRACKS, type Level, type Topic } from "@/data/topics";

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
          update: { $setOnInsert: { ...topic, practice: topic.practice ?? [], levels: topic.levels ?? [], track: t.key, topicId: id, order: id, archived: false } },
          upsert: true,
        },
      })),
    ),
  );
  await Meta.updateOne({ _id: "catalog-seeded" }, { $set: { at: new Date() } }, { upsert: true });
}

const seedTrack = (key: string) => SEED_TRACKS.find((t) => t.key === key)!;

/** Content changes to the seed that existing databases need too. Each runs once, keyed in Meta. */
const CATALOG_UPDATES: { id: string; run: () => Promise<unknown> }[] = [
  {
    // MySQL practice moved from LeetCode to DataLemur.
    id: "sql-datalemur-v1",
    run: async () => {
      const sql = seedTrack("sql");
      await Track.updateOne({ key: "sql" }, { $set: { description: sql.description } });
      await TrackTopic.bulkWrite(
        sql.topics
          .filter((t) => t.practice)
          .map((t) => ({ updateOne: { filter: { track: "sql", topicId: t.id }, update: { $set: { practice: t.practice } } } })),
      );
    },
  },
  {
    id: "dbms-track-v1",
    run: async () => {
      const dbms = seedTrack("dbms");
      const order = await Track.countDocuments();
      await Track.updateOne(
        { key: dbms.key },
        { $setOnInsert: { key: dbms.key, name: dbms.name, description: dbms.description, order, defaultOn: true, archived: false } },
        { upsert: true },
      );
      await TrackTopic.bulkWrite(
        dbms.topics.map(({ id, ...topic }) => ({
          updateOne: {
            filter: { track: dbms.key, topicId: id },
            update: { $setOnInsert: { ...topic, practice: topic.practice ?? [], track: dbms.key, topicId: id, order: id, archived: false } },
            upsert: true,
          },
        })),
      );
    },
  },
  {
    id: "oop-track-v1",
    run: async () => {
      const oop = seedTrack("oop");
      const order = await Track.countDocuments();
      await Track.updateOne(
        { key: oop.key },
        { $setOnInsert: { key: oop.key, name: oop.name, description: oop.description, order, defaultOn: true, archived: false } },
        { upsert: true },
      );
      await TrackTopic.bulkWrite(
        oop.topics.map(({ id, ...topic }) => ({
          updateOne: {
            filter: { track: oop.key, topicId: id },
            update: { $setOnInsert: { ...topic, practice: topic.practice ?? [], levels: topic.levels ?? [], track: oop.key, topicId: id, order: id, archived: false } },
            upsert: true,
          },
        })),
      );
    },
  },
  {
    id: "code-track-v1",
    run: async () => {
      const code = seedTrack("code");
      const order = await Track.countDocuments();
      await Track.updateOne(
        { key: code.key },
        { $setOnInsert: { key: code.key, name: code.name, description: code.description, order, defaultOn: true, archived: false } },
        { upsert: true },
      );
      await TrackTopic.bulkWrite(
        code.topics.map(({ id, ...topic }) => ({
          updateOne: {
            filter: { track: code.key, topicId: id },
            update: { $setOnInsert: { ...topic, practice: topic.practice ?? [], levels: [], track: code.key, topicId: id, order: id, archived: false } },
            upsert: true,
          },
        })),
      );
    },
  },
  {
    // Programming: one-language lessons (Java Collections Framework, Python core data types), ids 25+.
    // They are listed right after "Built-in data structures", so every code topic gets a new order.
    id: "code-collections-v1",
    run: async () => {
      const code = seedTrack("code");
      const old = code.topics.filter((t) => t.id <= 24);
      const at = old.findLastIndex((t) => t.section === "Built-in data structures") + 1;
      const shown = [...old.slice(0, at), ...code.topics.filter((t) => t.id > 24), ...old.slice(at)];
      await Track.updateOne({ key: code.key }, { $set: { description: code.description } });
      await TrackTopic.bulkWrite(
        shown.map(({ id, ...topic }, n) => ({
          updateOne: {
            filter: { track: code.key, topicId: id },
            update: {
              $setOnInsert: { ...topic, practice: topic.practice ?? [], levels: [], track: code.key, topicId: id, archived: false },
              $set: { order: n + 1 },
            },
            upsert: true,
          },
        })),
      );
    },
  },
  {
    // Company tags from github.com/liquidslr/leetcode-company-wise-problems, most frequent first.
    id: "companies-liquidslr-v1",
    run: () =>
      QuestionModel.bulkWrite(
        SEED_QUESTIONS.map((q) => ({ updateOne: { filter: { qid: q.id }, update: { $set: { companies: q.companies } } } })),
      ),
  },
];

async function applyCatalogUpdates() {
  const applied = new Set((await Meta.find({ _id: { $in: CATALOG_UPDATES.map((u) => u.id) } }, { _id: 1 }).lean()).map((m) => m._id));
  for (const u of CATALOG_UPDATES) {
    if (applied.has(u.id)) continue;
    await u.run();
    await Meta.updateOne({ _id: u.id }, { $set: { at: new Date() } }, { upsert: true });
  }
}

// Shared across requests (and instances, on Vercel) until an admin edit calls invalidateCatalog().
const loadCatalog = unstable_cache(
  async () => {
    await connectDB();
    await ensureSeeded();
    await applyCatalogUpdates();
    const [questions, tracks, topics] = await Promise.all([
      QuestionModel.find({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).sort({ qid: 1 }).lean(),
      Track.find({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).sort({ order: 1, key: 1 }).lean(),
      TrackTopic.find({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).sort({ order: 1, topicId: 1 }).lean(),
    ]);
    return { questions, tracks, topics };
  },
  ["catalog-v6"],
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
      .map(({ topicId, ...x }) => ({
        ...x,
        id: topicId,
        practice: x.practice?.length ? x.practice : undefined,
        levels: x.levels?.length ? (x.levels.filter((l) => (LEVELS as readonly string[]).includes(l)) as Level[]) : undefined,
      }));
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
