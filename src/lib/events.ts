import "server-only";
import { after } from "next/server";
import { Event, type EventType } from "./models";

/** Appends to the admin activity feed once the response is sent, so it never slows the action down. */
export function logEvent(userId: string, type: EventType, extra: { qid?: number; track?: string; topicId?: number } = {}) {
  after(async () => {
    try {
      await Event.create({ userId, type, ...extra });
    } catch (err) {
      console.error("event log failed", err);
    }
  });
}
