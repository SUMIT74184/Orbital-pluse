"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { QuestionModel, Track, TrackTopic } from "@/lib/models";
import { invalidateCatalog } from "@/lib/catalog";

export type AdminState = { ok?: string; error?: string } | undefined;

function changed() {
  invalidateCatalog();
  revalidatePath("/", "layout");
}

const lines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const url = z.url("Enter a full URL, starting with https://").max(300);

// ---------- DSA questions ----------

const questionSchema = z.object({
  qid: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(2, "Title is required").max(160),
  url,
  group: z.string().trim().min(2, "Pick or type a pattern").max(40),
  pattern: z.string().trim().max(60),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  companies: z
    .string()
    .max(4000)
    .transform((s) => [...new Set(s.split(",").map((c) => c.trim()).filter(Boolean))]),
});

export async function saveQuestion(_: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = questionSchema.safeParse({
    qid: formData.get("qid") || undefined,
    title: formData.get("title"),
    url: formData.get("url"),
    group: formData.get("group"),
    pattern: formData.get("pattern") ?? "",
    difficulty: formData.get("difficulty"),
    companies: formData.get("companies") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { qid, ...fields } = parsed.data;
  const doc = { ...fields, pattern: fields.pattern || fields.group };
  await connectDB();
  if (await QuestionModel.exists({ url: doc.url, ...(qid && { qid: { $ne: qid } }) })) return { error: "A question with this URL already exists" };

  if (qid) {
    const res = await QuestionModel.updateOne({ qid }, { $set: doc });
    if (!res.matchedCount) return { error: "Question not found" };
    changed();
    return { ok: "Question updated" };
  }
  // Ids are never reused, so progress on an archived question can't attach to a new one.
  for (let attempt = 0; attempt < 3; attempt++) {
    const last = await QuestionModel.findOne({}, { qid: 1 }).sort({ qid: -1 }).lean();
    try {
      await QuestionModel.create({ ...doc, qid: (last?.qid ?? 0) + 1 });
      changed();
      return { ok: `Added #${(last?.qid ?? 0) + 1} ${doc.title}` };
    } catch (err) {
      if ((err as { code?: number }).code !== 11000) throw err;
    }
  }
  return { error: "Couldn't allocate an id, try again" };
}

export async function setQuestionArchived(qid: number, archived: boolean) {
  await requireAdmin();
  await connectDB();
  await QuestionModel.updateOne({ qid }, { $set: { archived } });
  changed();
}

// ---------- Tracks ----------

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);

const trackSchema = z.object({
  key: z.string().optional(),
  name: z.string().trim().min(2, "Name is required").max(40),
  description: z.string().trim().max(200),
  defaultOn: z.boolean(),
});

export async function saveTrack(_: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = trackSchema.safeParse({
    key: formData.get("key") || undefined,
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    defaultOn: formData.get("defaultOn") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { key, ...fields } = parsed.data;
  await connectDB();

  if (key) {
    const res = await Track.updateOne({ key }, { $set: fields });
    if (!res.matchedCount) return { error: "Track not found" };
    changed();
    return { ok: "Track saved" };
  }
  const newKey = slug(fields.name);
  if (!newKey || newKey === "dsa") return { error: "Pick a different name" };
  if (await Track.exists({ key: newKey })) return { error: "A track with this name already exists" };
  const last = await Track.findOne({}, { order: 1 }).sort({ order: -1 }).lean();
  await Track.create({ ...fields, key: newKey, order: (last?.order ?? 0) + 1, archived: false });
  changed();
  redirect(`/admin/content/tracks/${newKey}`);
}

export async function setTrackArchived(key: string, archived: boolean) {
  await requireAdmin();
  await connectDB();
  await Track.updateOne({ key }, { $set: { archived } });
  changed();
}

// ---------- Track topics ----------

const topicSchema = z.object({
  track: z.string().min(1),
  topicId: z.coerce.number().int().positive().optional(),
  section: z.string().trim().min(2, "Section is required").max(40),
  title: z.string().trim().min(2, "Title is required").max(160),
  points: z
    .string()
    .transform(lines)
    .pipe(z.array(z.string().max(200)).max(12, "At most 12 key points")),
  practice: z
    .string()
    .transform(lines)
    .transform((ls) =>
      ls.map((l) => {
        const [title, link] = l.includes("|") ? l.split("|").map((x) => x.trim()) : [l, l];
        return { title: title || link, url: link };
      }),
    )
    .pipe(z.array(z.object({ title: z.string().max(120), url })).max(8, "At most 8 practice links")),
});

export async function saveTopic(_: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = topicSchema.safeParse({
    track: formData.get("track"),
    topicId: formData.get("topicId") || undefined,
    section: formData.get("section"),
    title: formData.get("title"),
    points: formData.get("points") ?? "",
    practice: formData.get("practice") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { track, topicId, ...fields } = parsed.data;
  await connectDB();
  if (!(await Track.exists({ key: track }))) return { error: "Track not found" };

  if (topicId) {
    const res = await TrackTopic.updateOne({ track, topicId }, { $set: fields });
    if (!res.matchedCount) return { error: "Topic not found" };
    changed();
    return { ok: "Topic updated" };
  }
  // New topics go to the end of the track; ids are never reused.
  for (let attempt = 0; attempt < 3; attempt++) {
    const [lastId, lastOrder] = await Promise.all([
      TrackTopic.findOne({ track }, { topicId: 1 }).sort({ topicId: -1 }).lean(),
      TrackTopic.findOne({ track }, { order: 1 }).sort({ order: -1 }).lean(),
    ]);
    try {
      await TrackTopic.create({ ...fields, track, topicId: (lastId?.topicId ?? 0) + 1, order: (lastOrder?.order ?? 0) + 1 });
      changed();
      return { ok: `Added “${fields.title}”` };
    } catch (err) {
      if ((err as { code?: number }).code !== 11000) throw err;
    }
  }
  return { error: "Couldn't allocate an id, try again" };
}

export async function setTopicArchived(track: string, topicId: number, archived: boolean) {
  await requireAdmin();
  await connectDB();
  await TrackTopic.updateOne({ track, topicId }, { $set: { archived } });
  changed();
}

/** Swaps a topic with its neighbour, which changes the order users receive them in. */
export async function moveTopic(track: string, topicId: number, dir: -1 | 1) {
  await requireAdmin();
  await connectDB();
  const topics = await TrackTopic.find({ track }, { topicId: 1, order: 1 }).sort({ order: 1, topicId: 1 }).lean();
  const i = topics.findIndex((t) => t.topicId === topicId);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= topics.length) return;
  // Renumber the whole track so ties left by older data can't make a swap a no-op.
  const order = topics.map((t) => t.topicId);
  [order[i], order[j]] = [order[j], order[i]];
  await TrackTopic.bulkWrite(order.map((id, n) => ({ updateOne: { filter: { track, topicId: id }, update: { $set: { order: n + 1 } } } })));
  changed();
}
