import "server-only";
import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface UserDoc {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  timezone: string;
  dailyTarget: number;
  revisionDays: number[];
  schedule?: string[][];
  tracks?: Record<string, boolean>; // track key -> on/off; missing keys fall back to the track's default
  reminders?: Reminders;
  goal?: Goal;
  lastSeenAt?: Date | null;
  lastSeenOn?: string | null; // YYYY-MM-DD in the user's timezone
  createdAt?: Date;
}

export const GOAL_LEVELS = ["beginner", "intermediate", "advanced"] as const;

export interface Goal {
  role: string | null; // e.g. "SDE-1", "Senior SDE"
  companies: string[];
  targetDate: string | null; // YYYY-MM-DD
  level: (typeof GOAL_LEVELS)[number] | null;
  interests: string[]; // "dsa" or track keys
  hoursPerWeek: number | null;
  updatedAt: Date | null;
}

export interface Reminders {
  daily: boolean;
  weekly: boolean;
  hour: number; // 0–23 in the user's timezone
  dailyAt: Date | null; // next daily send (UTC); null when off
  weeklyAt: Date | null; // next Sunday summary (UTC); null when off
  testAt: Date | null; // last test email, for rate limiting
}

export type EmailKind = "daily" | "weekly";

export interface EmailLogDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  kind: EmailKind;
  date: string; // YYYY-MM-DD in the user's timezone
  status: "sent" | "skipped" | "failed";
  detail: string | null;
  attempts: number;
  updatedAt?: Date;
}

export interface Revision {
  offset: number;
  due: string;
  doneOn: string | null;
}

export interface ProgressDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  qid: number;
  solvedOn: string;
  revisions: Revision[];
}

export interface PlanDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string;
  newQids: number[];
  topics?: { track: string; topicId: number }[];
  // Plans made before tracks were configurable store their two topics here instead.
  sdId?: number | null;
  sqlId?: number | null;
}

export interface TopicDoneDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  kind: string; // track key
  topicId: number;
  doneOn: string;
}

// ---------- Catalog (edited from the admin panel, seeded from src/data on first use) ----------

export interface QuestionDoc {
  _id: Types.ObjectId;
  qid: number;
  pattern: string;
  group: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  companies: string[];
  url: string;
  archived: boolean;
}

export interface TrackDoc {
  _id: Types.ObjectId;
  key: string;
  name: string;
  description: string;
  order: number;
  defaultOn: boolean;
  archived: boolean;
}

export interface TrackTopicDoc {
  _id: Types.ObjectId;
  track: string;
  topicId: number;
  section: string;
  title: string;
  points: string[];
  practice: { title: string; url: string }[];
  order: number;
  archived: boolean;
}

// ---------- Analytics ----------

export interface ActiveDayDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD in the user's timezone
}

export type EventType = "signup" | "login" | "solve" | "revise" | "topic";

export interface EventDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: EventType;
  qid?: number;
  track?: string;
  topicId?: number;
  at: Date;
}

export interface MetaDoc {
  _id: string;
  at: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    timezone: { type: String, default: "Asia/Kolkata" },
    dailyTarget: { type: Number, default: 3 },
    revisionDays: { type: [Number], default: [1, 4, 6, 10, 15, 21] },
    // Index = weekday (0 = Sunday); each entry lists the question groups for that day.
    schedule: { type: [[String]], default: undefined },
    tracks: { type: Map, of: Boolean, default: undefined },
    reminders: {
      daily: { type: Boolean, default: false },
      weekly: { type: Boolean, default: false },
      hour: { type: Number, default: 11 },
      dailyAt: { type: Date, default: null },
      weeklyAt: { type: Date, default: null },
      testAt: { type: Date, default: null },
    },
    goal: {
      type: new Schema(
        {
          role: { type: String, default: null },
          companies: { type: [String], default: [] },
          targetDate: { type: String, default: null },
          level: { type: String, enum: [...GOAL_LEVELS], default: null },
          interests: { type: [String], default: [] },
          hoursPerWeek: { type: Number, default: null },
          updatedAt: { type: Date, default: null },
        },
        { _id: false },
      ),
      default: undefined,
    },
    lastSeenAt: { type: Date, default: null },
    lastSeenOn: { type: String, default: null },
  },
  { timestamps: true },
);
// The cron dispatcher looks users up by their next due send.
userSchema.index({ "reminders.dailyAt": 1 });
userSchema.index({ "reminders.weeklyAt": 1 });

// One document per solved question per user. Revisions are fixed offsets from the solve date.
const progressSchema = new Schema<ProgressDoc>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    qid: { type: Number, required: true },
    solvedOn: { type: String, required: true }, // YYYY-MM-DD in the user's timezone
    revisions: [
      {
        _id: false,
        offset: Number,
        due: String,
        doneOn: { type: String, default: null },
      },
    ],
  },
  { timestamps: true },
);
progressSchema.index({ userId: 1, qid: 1 }, { unique: true });
progressSchema.index({ userId: 1, "revisions.due": 1 });

const planSchema = new Schema<PlanDoc>({
  userId: { type: Schema.Types.ObjectId, required: true },
  date: { type: String, required: true },
  newQids: [Number],
  topics: { type: [{ _id: false, track: String, topicId: Number }], default: undefined },
  sdId: Number,
  sqlId: Number,
});
planSchema.index({ userId: 1, date: 1 }, { unique: true });

const topicDoneSchema = new Schema<TopicDoneDoc>({
  userId: { type: Schema.Types.ObjectId, required: true },
  kind: { type: String, required: true },
  topicId: { type: Number, required: true },
  doneOn: { type: String, required: true },
});
topicDoneSchema.index({ userId: 1, kind: 1, topicId: 1 }, { unique: true });

// One row per user per email per day: the dispatcher checks it so a retry never sends twice.
const emailLogSchema = new Schema<EmailLogDoc>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    kind: { type: String, enum: ["daily", "weekly"], required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ["sent", "skipped", "failed"], required: true },
    detail: { type: String, default: null },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);
emailLogSchema.index({ userId: 1, kind: 1, date: 1 }, { unique: true });

const questionSchema = new Schema<QuestionDoc>(
  {
    qid: { type: Number, required: true, unique: true },
    pattern: { type: String, required: true, trim: true },
    group: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    companies: { type: [String], default: [] },
    url: { type: String, required: true, trim: true },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const trackSchema = new Schema<TrackDoc>(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
    defaultOn: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Users get a track's topics in `order`; topicId never changes, so progress survives reordering.
const trackTopicSchema = new Schema<TrackTopicDoc>(
  {
    track: { type: String, required: true },
    topicId: { type: Number, required: true },
    section: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    points: { type: [String], default: [] },
    practice: { type: [{ _id: false, title: String, url: String }], default: [] },
    order: { type: Number, required: true },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);
trackTopicSchema.index({ track: 1, topicId: 1 }, { unique: true });

// One row per user per day they opened the app: the source for DAU / WAU / MAU.
const activeDaySchema = new Schema<ActiveDayDoc>({
  userId: { type: Schema.Types.ObjectId, required: true },
  date: { type: String, required: true },
});
activeDaySchema.index({ userId: 1, date: 1 }, { unique: true });
activeDaySchema.index({ date: 1 });

// Append-only activity feed for the admin panel.
const eventSchema = new Schema<EventDoc>({
  userId: { type: Schema.Types.ObjectId, required: true },
  type: { type: String, required: true },
  qid: Number,
  track: String,
  topicId: Number,
  at: { type: Date, default: () => new Date() },
});
eventSchema.index({ at: -1 });
eventSchema.index({ userId: 1, at: -1 });

// One-off jobs (seeding, backfills) record that they ran here.
const metaSchema = new Schema<MetaDoc>({ _id: String, at: Date });

function model<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) ?? mongoose.model<T>(name, schema);
}

export const User = model<UserDoc>("User", userSchema);
export const Progress = model<ProgressDoc>("Progress", progressSchema);
export const Plan = model<PlanDoc>("Plan", planSchema);
export const TopicDone = model<TopicDoneDoc>("TopicDone", topicDoneSchema);
export const EmailLog = model<EmailLogDoc>("EmailLog", emailLogSchema);
export const QuestionModel = model<QuestionDoc>("Question", questionSchema);
export const Track = model<TrackDoc>("Track", trackSchema);
export const TrackTopic = model<TrackTopicDoc>("TrackTopic", trackTopicSchema);
export const ActiveDay = model<ActiveDayDoc>("ActiveDay", activeDaySchema);
export const Event = model<EventDoc>("Event", eventSchema);
export const Meta = model<MetaDoc>("Meta", metaSchema);
