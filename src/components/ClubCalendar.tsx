import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  getClubEvents,
  adminListEvents,
  deleteEvent,
  setEventStatus,
} from "@/lib/calendar.functions";
import { CATEGORIES, categorize, type ClubEvent } from "@/lib/calendar-types";
import { BookingDialog } from "@/components/BookingDialog";
import { EventEditor } from "@/components/EventEditor";
import { useSession } from "@/hooks/useSession";

const TZ = "Europe/Prague";
const MONTHS = [
  "Leden",
  "Únor",
  "Březen",
  "Duben",
  "Květen",
  "Červen",
  "Červenec",
  "Srpen",
  "Září",
  "Říjen",
  "Listopad",
  "Prosinec",
];
const WEEKDAYS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

function dayKey(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function timeLabel(iso: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function longDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("cs-CZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(y!, m! - 1, d!, 12)));
}

function googleLink(e: ClubEvent) {
  const fmt = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${fmt(e.start)}/${fmt(e.end)}`,
    details: e.description ?? "",
    location: e.location ?? "Lidická 194, Strakonice",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Čeká na potvrzení",
  confirmed: "Potvrzeno",
  rejected: "Zamítnuto",
};

export function ClubCalendar({ compact = false }: { compact?: boolean }) {
  const todayKey = dayKey(new Date().toISOString());
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = useState<string | null>(todayKey);
  const [filter, setFilter] = useState<string | null>(null);
  const [booking, setBooking] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ event: ClubEvent | null; dateKey: string } | null>(null);

  const queryClient = useQueryClient();
  const { session } = useSession();
  const removeEvent = useServerFn(deleteEvent);
  const changeStatus = useServerFn(setEventStatus);

  const { data, isLoading } = useQuery({
    queryKey: ["club-events"],
    queryFn: () => getClubEvents(),
    staleTime: 5 * 60 * 1000,
  });

  const admin = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => adminListEvents(),
    enabled: Boolean(session),
    staleTime: 60 * 1000,
    retry: false,
  });

  const isAdmin = admin.data?.isAdmin === true;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["club-events"] });
    queryClient.invalidateQueries({ queryKey: ["admin-events"] });
  };

  const events = useMemo(() => {
    const publicEvents = data?.events ?? [];
    const list = isAdmin
      ? [
          ...publicEvents.filter((e) => e.source !== "db"),
          ...(admin.data?.events ?? []).filter((e) => e.status !== "rejected"),
        ]
      : publicEvents;
    return filter ? list.filter((e) => categorize(e.title).key === filter) : list;
  }, [data, admin.data, isAdmin, filter]);

  const byDay = useMemo(() => {
    const map = new Map<string, ClubEvent[]>();
    for (const e of events) {
      const k = dayKey(e.start);
      const arr = map.get(k);
      if (arr) arr.push(e);
      else map.set(k, [e]);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.start.localeCompare(b.start));
    return map;
  }, [events]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return events
      .filter((e) => new Date(e.end).getTime() >= now)
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, compact ? 4 : 8);
  }, [events, compact]);

  const grid = useMemo(() => {
    const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
    const offset = (first.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();
    const cells: Array<{ key: string; day: number; inMonth: boolean }> = [];
    for (let i = 0; i < offset; i++) {
      const d = new Date(Date.UTC(cursor.year, cursor.month, 1 - (offset - i)));
      cells.push({ key: d.toISOString().slice(0, 10), day: d.getUTCDate(), inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(Date.UTC(cursor.year, cursor.month, d));
      cells.push({ key: date.toISOString().slice(0, 10), day: d, inMonth: true });
    }
    while (cells.length % 7 !== 0) {
      const last = new Date(`${cells[cells.length - 1]!.key}T00:00:00Z`);
      last.setUTCDate(last.getUTCDate() + 1);
      cells.push({ key: last.toISOString().slice(0, 10), day: last.getUTCDate(), inMonth: false });
    }
    return cells;
  }, [cursor]);

  const shift = (delta: number) => {
    setCursor((c) => {
      const m = c.month + delta;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  };

  const selectedEvents = selected ? (byDay.get(selected) ?? []) : [];

  const onDelete = async (id: string) => {
    try {
      await removeEvent({ data: { id } });
      toast.success("Akce smazána.");
      refresh();
    } catch {
      toast.error("Smazání se nepovedlo.");
    }
  };

  const onStatus = async (id: string, status: "pending" | "confirmed" | "rejected") => {
    try {
      await changeStatus({ data: { id, status } });
      toast.success(status === "confirmed" ? "Termín potvrzen." : "Stav změněn.");
      refresh();
    } catch {
      toast.error("Změna se nepovedla.");
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.9fr_1fr]">
      <div className="surface relative overflow-hidden rounded-lg p-5 md:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
              Program klubu
            </p>
            <h3 className="mt-1 font-display text-3xl md:text-4xl">
              {MONTHS[cursor.month]} <span className="text-primary">{cursor.year}</span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setEditing({ event: null, dateKey: selected ?? todayKey })}
                className="rounded-sm bg-primary px-4 py-2 text-[0.65rem] uppercase tracking-widest text-primary-foreground"
              >
                + Akce
              </button>
            )}
            <button
              type="button"
              onClick={() => shift(-1)}
              aria-label="Předchozí měsíc"
              className="h-10 w-10 rounded-sm border border-border text-sm transition-colors hover:border-primary hover:text-primary"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => {
                const n = new Date();
                setCursor({ year: n.getFullYear(), month: n.getMonth() });
                setSelected(todayKey);
              }}
              className="rounded-sm border border-border px-3 py-2.5 text-[0.65rem] uppercase tracking-widest transition-colors hover:border-primary hover:text-primary"
            >
              Dnes
            </button>
            <button
              type="button"
              onClick={() => shift(1)}
              aria-label="Další měsíc"
              className="h-10 w-10 rounded-sm border border-border text-sm transition-colors hover:border-primary hover:text-primary"
            >
              ›
            </button>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className={`rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-widest transition-colors ${
              filter === null ? "border-primary text-primary" : "border-border text-muted-foreground"
            }`}
          >
            Vše
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(filter === c.key ? null : c.key)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-widest transition-colors ${
                filter === c.key ? "border-primary text-primary" : "border-border text-muted-foreground"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${c.dot}`} />
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative mt-7 grid grid-cols-7 gap-1.5 text-center text-[0.7rem] uppercase tracking-widest text-muted-foreground">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>

        <div className="relative mt-1.5 grid grid-cols-7 gap-1.5">
          {grid.map((cell) => {
            const dayEvents = byDay.get(cell.key) ?? [];
            const isToday = cell.key === todayKey;
            const isSelected = cell.key === selected;
            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => setSelected(cell.key)}
                className={`group relative flex min-h-[100px] flex-col items-start gap-1.5 rounded-md border p-2 text-left transition-all duration-200 sm:min-h-[120px] md:min-h-[140px] ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-[var(--shadow-forge)]"
                    : "border-border/60 hover:-translate-y-0.5 hover:border-primary/60"
                } ${cell.inMonth ? "" : "opacity-35"}`}
              >
                <span
                  className={`text-sm ${isToday ? "flex h-7 w-7 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground" : "text-muted-foreground"}`}
                >
                  {cell.day}
                </span>
                <span className="flex w-full flex-col gap-1">
                  {dayEvents.slice(0, 3).map((e) => {
                    const cat = categorize(e.title);
                    return (
                      <span
                        key={e.id}
                        className={`truncate rounded-[4px] border px-1.5 py-1 text-[0.65rem] leading-tight ${cat.className} ${
                          e.status === "pending" ? "border-dashed opacity-80" : ""
                        }`}
                      >
                        {e.status === "pending" ? "⏳ " : ""}
                        {!e.allDay && `${timeLabel(e.start)} `}
                        {e.title}
                      </span>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <span className="text-[0.65rem] text-muted-foreground">
                      +{dayEvents.length - 3} další
                    </span>
                  )}
                </span>
                <span className="mt-auto text-[0.6rem] uppercase tracking-widest text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  {isAdmin ? "spravovat" : "rezervovat"}
                </span>
              </button>
            );
          })}
        </div>
        {isLoading && (
          <p className="relative mt-4 text-xs text-muted-foreground">Načítám program klubu…</p>
        )}
        {data?.error && <p className="relative mt-4 text-xs text-muted-foreground">{data.error}</p>}
      </div>

      <div className="surface rounded-lg p-5 md:p-7">
        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
          {selected ? "Vybraný den" : "Nejbližší akce"}
        </p>
        <h3 className="mt-1 font-display text-xl">
          {selected ? longDate(selected) : "Co se chystá"}
        </h3>
        <div className="ember-rule mt-4 h-px w-16" />

        {selected && (
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setBooking(selected)}
              className="rounded-sm bg-primary px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.2em] text-primary-foreground shadow-[var(--shadow-forge)] transition-transform hover:-translate-y-0.5"
            >
              Rezervovat tento den
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setEditing({ event: null, dateKey: selected })}
                className="rounded-sm border border-border px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.2em] hover:border-primary hover:text-primary"
              >
                Přidat akci
              </button>
            )}
          </div>
        )}

        <div className="mt-5 space-y-3">
          {(selected ? selectedEvents : upcoming).map((e) => {
            const cat = categorize(e.title);
            const editable = isAdmin && e.source === "db";
            return (
              <article
                key={e.id}
                className="group rounded-md border border-border/70 p-4 transition-colors hover:border-primary/60"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${cat.dot}`} />
                  <span className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">
                    {cat.label}
                  </span>
                  {e.status && e.status !== "confirmed" && (
                    <span className="rounded-full border border-dashed border-primary/60 px-2 py-0.5 text-[0.55rem] uppercase tracking-widest text-primary">
                      {STATUS_LABEL[e.status]}
                    </span>
                  )}
                </div>
                <h4 className="mt-2 font-display text-base text-primary">{e.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selected ? "" : `${longDate(dayKey(e.start))} · `}
                  {e.allDay ? "celý den" : `${timeLabel(e.start)} – ${timeLabel(e.end)}`}
                </p>
                {e.description && (
                  <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                    {e.description}
                  </p>
                )}
                {editable && e.requesterEmail && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {e.requesterName} · {e.requesterEmail}
                  </p>
                )}
                {editable ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {e.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => onStatus(e.id, "confirmed")}
                        className="rounded-sm bg-primary px-3 py-1.5 text-[0.6rem] uppercase tracking-widest text-primary-foreground"
                      >
                        Potvrdit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditing({ event: e, dateKey: dayKey(e.start) })}
                      className="rounded-sm border border-border px-3 py-1.5 text-[0.6rem] uppercase tracking-widest hover:border-primary hover:text-primary"
                    >
                      Upravit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(e.id)}
                      className="rounded-sm border border-destructive/60 px-3 py-1.5 text-[0.6rem] uppercase tracking-widest text-destructive hover:bg-destructive/10"
                    >
                      Smazat
                    </button>
                  </div>
                ) : (
                  <a
                    href={googleLink(e)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-[0.6rem] uppercase tracking-widest text-primary opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Přidat do kalendáře
                  </a>
                )}
              </article>
            );
          })}
          {!isLoading && (selected ? selectedEvents : upcoming).length === 0 && (
            <p className="text-sm text-muted-foreground">
              {selected
                ? "V tento den nemáme vyhlášenou akci – klidně si ho rezervuj."
                : "Zatím nejsou vyhlášeny žádné nadcházející akce."}
            </p>
          )}
        </div>
      </div>

      {booking && (
        <BookingDialog dateKey={booking} onClose={() => setBooking(null)} onSent={refresh} />
      )}
      {editing && (
        <EventEditor
          event={editing.event}
          dateKey={editing.dateKey}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
