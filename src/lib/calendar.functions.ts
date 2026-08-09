import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ClubEvent } from "./calendar-types";

const bookingSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  hours: z.number().min(1).max(12),
  people: z.number().min(1).max(60),
  note: z.string().trim().max(600),
});

const eventSchema = z.object({
  id: z.string().uuid().nullable(),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000),
  location: z.string().trim().max(160),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  hours: z.number().min(1).max(24),
  status: z.enum(["pending", "confirmed", "rejected"]),
});

/** Public: Google kalendář klubu + potvrzené akce z administrace. */
export const getClubEvents = createServerFn({ method: "GET" }).handler(async (): Promise<{
  events: ClubEvent[];
  error: string | null;
}> => {
  const { fetchIcsEvents, serverPublicClient, rowToEvent } = await import("./events.server");
  const ics = await fetchIcsEvents();
  const { data, error } = await serverPublicClient()
    .from("club_events")
    .select(
      "id, title, description, location, starts_at, ends_at, all_day, status, requester_name, requester_email",
    )
    .eq("status", "confirmed")
    .order("starts_at", { ascending: true });
  if (error) console.error("club_events read failed", error.message);
  const dbEvents = (data ?? []).map((r) =>
    rowToEvent({ ...r, requester_name: null, requester_email: null }),
  );
  return { events: [...ics.events, ...dbEvents], error: ics.error };
});

/** Public: návštěvník požádá o termín, admin ho potvrdí odkazem z e-mailu nebo v administraci. */
export const requestBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bookingSchema.parse(data))
  .handler(async ({ data }) => {
    const { pragueToIso, CLUB_EMAIL } = await import("./events.server");
    const { sendBookingRequestEmail } = await import("./booking-email.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const startsAt = pragueToIso(data.date, data.time);
    const endsAt = new Date(new Date(startsAt).getTime() + data.hours * 3_600_000).toISOString();

    const { data: row, error } = await supabaseAdmin
      .from("club_events")
      .insert({
        title: `Rezervace – ${data.name} (${data.people} os.)`,
        description: data.note || null,
        location: "Lidická 194, Strakonice",
        starts_at: startsAt,
        ends_at: endsAt,
        status: "pending",
        requester_name: data.name,
        requester_email: data.email,
      })
      .select("id, approve_token, starts_at, ends_at")
      .single();

    if (error || !row) {
      console.error("booking insert failed", error?.message);
      return { ok: false as const, emailed: false, message: "Rezervaci se nepodařilo uložit." };
    }

    const sent = await sendBookingRequestEmail({
      to: CLUB_EMAIL,
      token: row.approve_token as string,
      name: data.name,
      email: data.email,
      people: data.people,
      note: data.note,
      startsAt: row.starts_at as string,
      endsAt: row.ends_at as string,
    });

    return { ok: true as const, emailed: sent, message: null };
  });

/** Admin: všechny akce včetně čekajících rezervací. */
export const adminListEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) return { isAdmin: false as const, events: [] };
    const { rowToEvent } = await import("./events.server");
    const { data, error } = await context.supabase
      .from("club_events")
      .select(
        "id, title, description, location, starts_at, ends_at, all_day, status, requester_name, requester_email",
      )
      .order("starts_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { isAdmin: true as const, events: (data ?? []).map(rowToEvent) };
  });

/** Admin: vytvoření nebo úprava akce. */
export const saveEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => eventSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { pragueToIso } = await import("./events.server");
    const startsAt = pragueToIso(data.date, data.time);
    const endsAt = new Date(new Date(startsAt).getTime() + data.hours * 3_600_000).toISOString();
    const payload = {
      title: data.title,
      description: data.description || null,
      location: data.location || null,
      starts_at: startsAt,
      ends_at: endsAt,
      status: data.status,
    };
    const query = data.id
      ? context.supabase.from("club_events").update(payload).eq("id", data.id)
      : context.supabase.from("club_events").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin: změna stavu akce (potvrzení / zamítnutí). */
export const setEventStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["pending", "confirmed", "rejected"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("club_events")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin: smazání akce. */
export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("club_events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
