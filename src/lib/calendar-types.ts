export type ClubEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start: string; // ISO
  end: string; // ISO
  allDay: boolean;
  /** "ics" = Google kalendář klubu, "db" = akce spravovaná v administraci */
  source?: "ics" | "db";
  status?: "pending" | "confirmed" | "rejected";
  requesterName?: string | null;
  requesterEmail?: string | null;
};

export type EventCategory = {
  key: string;
  label: string;
  className: string;
  dot: string;
};

export const CATEGORIES: EventCategory[] = [
  {
    key: "tcg",
    label: "Karetní hry",
    className: "bg-[oklch(0.74_0.145_72_/_0.16)] text-primary border-primary/40",
    dot: "bg-primary",
  },
  {
    key: "wargaming",
    label: "Wargaming",
    className: "bg-[oklch(0.52_0.16_25_/_0.2)] text-accent-foreground border-accent/50",
    dot: "bg-accent",
  },
  {
    key: "hobby",
    label: "Malování & hobby",
    className: "bg-[oklch(0.6_0.09_150_/_0.18)] text-foreground border-[oklch(0.6_0.09_150)]/50",
    dot: "bg-[oklch(0.65_0.11_150)]",
  },
  {
    key: "other",
    label: "Ostatní",
    className: "bg-secondary/60 text-foreground border-border",
    dot: "bg-muted-foreground",
  },
];

export function categorize(title: string): EventCategory {
  const t = title.toLowerCase();
  if (/(star wars|unlimited|riftbound|magic|weekly play|tcg|karet)/.test(t)) return CATEGORIES[0]!;
  if (/(warhammer|40k|sigmar|aos|conquest|legion|wargam|bitva)/.test(t)) return CATEGORIES[1]!;
  if (/(paint|malov|hobby|challenge)/.test(t)) return CATEGORIES[2]!;
  return CATEGORIES[3]!;
}

export type BookingRequestInput = {
  name: string;
  email: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  hours: number;
  people: number;
  note: string;
};
