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
  tracks?: { sd?: boolean; sql?: boolean };
  createdAt?: Date;
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
  sdId: number | null;
  sqlId: number | null;
}

export interface TopicDoneDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  kind: "sd" | "sql";
  topicId: number;
  doneOn: string;
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
    tracks: {
      sd: { type: Boolean, default: true },
      sql: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

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
  sdId: { type: Number, default: null },
  sqlId: { type: Number, default: null },
});
planSchema.index({ userId: 1, date: 1 }, { unique: true });

const topicDoneSchema = new Schema<TopicDoneDoc>({
  userId: { type: Schema.Types.ObjectId, required: true },
  kind: { type: String, enum: ["sd", "sql"], required: true },
  topicId: { type: Number, required: true },
  doneOn: { type: String, required: true },
});
topicDoneSchema.index({ userId: 1, kind: 1, topicId: 1 }, { unique: true });

function model<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) ?? mongoose.model<T>(name, schema);
}

export const User = model<UserDoc>("User", userSchema);
export const Progress = model<ProgressDoc>("Progress", progressSchema);
export const Plan = model<PlanDoc>("Plan", planSchema);
export const TopicDone = model<TopicDoneDoc>("TopicDone", topicDoneSchema);
