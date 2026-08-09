import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { saveEvent } from "@/lib/calendar.functions";
import type { ClubEvent } from "@/lib/calendar-types";

const TZ = "Europe/Prague";

function timeValue(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function EventEditor({
  event,
  dateKey,
  onClose,
  onSaved,
}: {
  event: ClubEvent | null;
  dateKey: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const save = useServerFn(saveEvent);
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "Lidická 194, Strakonice");
  const [date, setDate] = useState(dateKey);
  const [time, setTime] = useState(event ? timeValue(event.start) : "17:00");
  const [hours, setHours] = useState(
    event
      ? Math.max(
          1,
          Math.round((new Date(event.end).getTime() - new Date(event.start).getTime()) / 3_600_000),
        )
      : 3,
  );
  const [status, setStatus] = useState<"pending" | "confirmed" | "rejected">(
    event?.status ?? "confirmed",
  );
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await save({
        data: { id: event?.id ?? null, title, description, location, date, time, hours, status },
      });
      toast.success(event ? "Akce upravena." : "Akce vytvořena.");
      onSaved();
    } catch {
      toast.error("Uložení se nepovedlo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <form
        onSubmit={submit}
        className="surface rise-in relative grid max-h-[90vh] w-full max-w-lg gap-4 overflow-y-auto rounded-lg p-6 md:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít"
          className="absolute right-4 top-4 h-8 w-8 rounded-full border border-border text-sm text-muted-foreground hover:border-primary hover:text-primary"
        >
          ×
        </button>
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
            Administrace kalendáře
          </p>
          <h3 className="mt-1 font-display text-2xl">{event ? "Upravit akci" : "Nová akce"}</h3>
          <div className="ember-rule mt-4 h-px w-16" />
        </div>

        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Název akce"
          className="rounded-sm border border-input bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Popis"
          className="rounded-sm border border-input bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Místo"
          className="rounded-sm border border-input bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1.5 text-xs text-muted-foreground">
            Datum
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-sm border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-1.5 text-xs text-muted-foreground">
            Začátek
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-sm border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-1.5 text-xs text-muted-foreground">
            Hodin
            <input
              type="number"
              min={1}
              max={24}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="rounded-sm border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
        <label className="grid gap-1.5 text-xs text-muted-foreground">
          Stav
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="rounded-sm border border-input bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="confirmed">Potvrzeno (viditelné na webu)</option>
            <option value="pending">Čeká na potvrzení</option>
            <option value="rejected">Zamítnuto (skryté)</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={busy}
          className="rounded-sm bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Ukládám…" : "Uložit"}
        </button>
      </form>
    </div>
  );
}
