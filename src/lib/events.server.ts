import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { parseIcs } from "./ics.server";
import type { ClubEvent } from "./calendar-types";

const ICS_URL =
  "https://calendar.google.com/calendar/ical/kostka.prokleta%40gmail.com/public/basic.ics";

export const CLUB_EMAIL = "kostka.prokleta@gmail.com";

export function serverPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Minutes east of UTC for Europe/Prague at the given instant. */
export function pragueOffset(at: Date): number {
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Prague",
    timeZoneName: "shortOffset",
  })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName")?.value;
  const m = /GMT([+-]\d{1,2})(?::(\d{2}))?/.exec(part ?? "GMT+1");
  if (!m) return 60;
  return Number(m[1]) * 60 + (Number(m[2] ?? 0) || 0);
}

/** Builds a UTC ISO string from a Prague-local date (YYYY-MM-DD) and time (HH:MM). */
export function pragueToIso(date: string, time: string): string {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const guess = Date.UTC(y!, mo! - 1, d!, h!, mi!);
  return new Date(guess - pragueOffset(new Date(guess)) * 60_000).toISOString();
}

export async function fetchIcsEvents(): Promise<{ events: ClubEvent[]; error: string | null }> {
  try {
    const res = await fetch(ICS_URL, { headers: { accept: "text/calendar" } });
    if (!res.ok) {
      console.error(`Calendar fetch failed [${res.status}]`);
      return { events: [], error: "Google kalendář se nepodařilo načíst." };
    }
    const raw = await res.text();
    const now = new Date();
    const windowStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const windowEnd = new Date(now.getFullYear() + 1, now.getMonth() + 6, 0);
    return { events: parseIcs(raw, windowStart, windowEnd), error: null };
  } catch (e) {
    console.error("Calendar fetch error", e);
    return { events: [], error: "Google kalendář se nepodařilo načíst." };
  }
}

export type DbEventRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  status: string;
  requester_name: string | null;
  requester_email: string | null;
};

export function rowToEvent(r: DbEventRow): ClubEvent {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    location: r.location,
    start: r.starts_at,
    end: r.ends_at,
    allDay: r.all_day,
    source: "db",
    status: (r.status as "pending" | "confirmed" | "rejected") ?? "confirmed",
    requesterName: r.requester_name,
    requesterEmail: r.requester_email,
  };
}
