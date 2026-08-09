import type { ClubEvent } from "./calendar-types";

export type { ClubEvent };

function unfold(raw: string): string[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of lines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && out.length > 0) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function unescape(value: string): string {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

/** Parses an ICS date value into a UTC Date. TZID values are treated as Europe/Prague. */
function parseIcsDate(value: string, params: Record<string, string>): { date: Date; allDay: boolean } {
  const v = value.trim();
  if (/^\d{8}$/.test(v) || params["VALUE"] === "DATE") {
    const y = Number(v.slice(0, 4));
    const m = Number(v.slice(4, 6));
    const d = Number(v.slice(6, 8));
    return { date: new Date(Date.UTC(y, m - 1, d)), allDay: true };
  }
  const y = Number(v.slice(0, 4));
  const mo = Number(v.slice(4, 6));
  const d = Number(v.slice(6, 8));
  const h = Number(v.slice(9, 11));
  const mi = Number(v.slice(11, 13));
  const s = Number(v.slice(13, 15) || "0");
  if (v.endsWith("Z")) {
    return { date: new Date(Date.UTC(y, mo - 1, d, h, mi, s)), allDay: false };
  }
  // Floating / TZID local time — assume Europe/Prague (CET/CEST).
  const guess = Date.UTC(y, mo - 1, d, h, mi, s);
  const offset = pragueOffsetMinutes(new Date(guess));
  return { date: new Date(guess - offset * 60_000), allDay: false };
}

/** Minutes east of UTC for Europe/Prague at the given instant (60 or 120). */
function pragueOffsetMinutes(at: Date): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Prague",
    timeZoneName: "shortOffset",
  });
  const part = fmt.formatToParts(at).find((p) => p.type === "timeZoneName")?.value ?? "GMT+1";
  const m = /GMT([+-]\d{1,2})(?::(\d{2}))?/.exec(part);
  if (!m) return 60;
  return Number(m[1]) * 60 + (Number(m[2] ?? 0) || 0);
}

const DAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function expandRecurrence(
  start: Date,
  end: Date,
  rrule: string,
  exdates: number[],
  windowStart: Date,
  windowEnd: Date,
): Array<{ start: Date; end: Date }> {
  const parts: Record<string, string> = {};
  for (const chunk of rrule.split(";")) {
    const [k, v] = chunk.split("=");
    if (k && v) parts[k.toUpperCase()] = v;
  }
  const freq = parts["FREQ"];
  const interval = Number(parts["INTERVAL"] ?? 1) || 1;
  const count = parts["COUNT"] ? Number(parts["COUNT"]) : undefined;
  const until = parts["UNTIL"] ? parseIcsDate(parts["UNTIL"], {}).date : undefined;
  const byDay = parts["BYDAY"] ? parts["BYDAY"].split(",").map((d) => d.slice(-2)) : [];
  const duration = end.getTime() - start.getTime();

  const out: Array<{ start: Date; end: Date }> = [];
  const push = (d: Date) => {
    if (until && d > until) return false;
    if (exdates.includes(d.getTime())) return true;
    if (d >= windowStart && d <= windowEnd) out.push({ start: d, end: new Date(d.getTime() + duration) });
    return true;
  };

  let cursor = new Date(start.getTime());
  let emitted = 0;
  const hardCap = 800;
  for (let i = 0; i < hardCap; i++) {
    if (count && emitted >= count) break;
    if (cursor > windowEnd) break;
    if (freq === "WEEKLY" && byDay.length > 0) {
      const weekStart = new Date(cursor.getTime());
      weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
      for (const code of byDay) {
        const idx = DAY_CODES.indexOf(code);
        if (idx < 0) continue;
        const occ = new Date(weekStart.getTime());
        occ.setUTCDate(weekStart.getUTCDate() + ((idx + 6) % 7));
        if (occ < start) continue;
        if (!push(occ)) return out;
        emitted++;
      }
      cursor = new Date(cursor.getTime());
      cursor.setUTCDate(cursor.getUTCDate() + 7 * interval);
    } else if (freq === "WEEKLY") {
      if (!push(new Date(cursor.getTime()))) return out;
      emitted++;
      cursor.setUTCDate(cursor.getUTCDate() + 7 * interval);
    } else if (freq === "DAILY") {
      if (!push(new Date(cursor.getTime()))) return out;
      emitted++;
      cursor.setUTCDate(cursor.getUTCDate() + interval);
    } else if (freq === "MONTHLY") {
      if (!push(new Date(cursor.getTime()))) return out;
      emitted++;
      cursor.setUTCMonth(cursor.getUTCMonth() + interval);
    } else if (freq === "YEARLY") {
      if (!push(new Date(cursor.getTime()))) return out;
      emitted++;
      cursor.setUTCFullYear(cursor.getUTCFullYear() + interval);
    } else {
      break;
    }
  }
  return out;
}

export function parseIcs(raw: string, windowStart: Date, windowEnd: Date): ClubEvent[] {
  const lines = unfold(raw);
  const events: ClubEvent[] = [];
  let current: Record<string, { value: string; params: Record<string, string> }> | null = null;
  let exdates: number[] = [];
  let inTimezone = false;

  for (const line of lines) {
    if (line.startsWith("BEGIN:VTIMEZONE")) inTimezone = true;
    if (line.startsWith("END:VTIMEZONE")) inTimezone = false;
    if (inTimezone) continue;

    if (line.startsWith("BEGIN:VEVENT")) {
      current = {};
      exdates = [];
      continue;
    }
    if (line.startsWith("END:VEVENT")) {
      if (current && current["DTSTART"]) {
        const startInfo = parseIcsDate(current["DTSTART"].value, current["DTSTART"].params);
        const endInfo = current["DTEND"]
          ? parseIcsDate(current["DTEND"].value, current["DTEND"].params)
          : { date: new Date(startInfo.date.getTime() + 2 * 3600_000), allDay: startInfo.allDay };
        const title = unescape(current["SUMMARY"]?.value ?? "Akce");
        const description = current["DESCRIPTION"] ? unescape(current["DESCRIPTION"].value) : null;
        const location = current["LOCATION"] ? unescape(current["LOCATION"].value) : null;
        const uid = current["UID"]?.value ?? title;

        const occurrences = current["RRULE"]
          ? expandRecurrence(
              startInfo.date,
              endInfo.date,
              current["RRULE"].value,
              exdates,
              windowStart,
              windowEnd,
            )
          : [{ start: startInfo.date, end: endInfo.date }];

        for (const occ of occurrences) {
          if (occ.end < windowStart || occ.start > windowEnd) continue;
          events.push({
            id: `${uid}-${occ.start.getTime()}`,
            title,
            description: description && description.length > 0 ? description : null,
            location,
            start: occ.start.toISOString(),
            end: occ.end.toISOString(),
            allDay: startInfo.allDay,
          });
        }
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const sep = line.indexOf(":");
    if (sep < 0) continue;
    const head = line.slice(0, sep);
    const value = line.slice(sep + 1);
    const [rawName, ...paramParts] = head.split(";");
    const name = rawName ?? "";
    const params: Record<string, string> = {};
    for (const p of paramParts) {
      const [k, v] = p.split("=");
      if (k && v) params[k.toUpperCase()] = v;
    }
    if (name === "EXDATE") {
      for (const v of value.split(",")) exdates.push(parseIcsDate(v, params).date.getTime());
      continue;
    }
    current[name] = { value, params };
  }

  return events.sort((a, b) => a.start.localeCompare(b.start));
}
