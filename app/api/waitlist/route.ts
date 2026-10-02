import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import { sendWaitlistConfirmation } from "../../../lib/waitlist-email";

export const runtime = "nodejs";

type WaitlistRequest = { email?: unknown; first_name?: unknown; source?: unknown };

function normalizedEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function POST(request: Request) {
  let body: WaitlistRequest;
  try { body = await request.json() as WaitlistRequest; } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const email = normalizedEmail(body.email);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  const firstName = typeof body.first_name === "string" ? body.first_name.trim().slice(0, 80) || null : null;
  const source = typeof body.source === "string" ? body.source.trim().slice(0, 120) || "hero-waitlist" : "hero-waitlist";
  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch (error) {
    console.error("waitlist service configuration failed", error);
    return NextResponse.json({ error: "The waitlist service is not configured yet." }, { status: 503 });
  }
  let signup: { id: string; email: string; confirmation_sent_at: string | null; status: string } | null = null;
  let duplicate = false;

  const insertResult = await supabase.from("waitlist").insert({ email, first_name: firstName, source, status: "pending" }).select("id,email,confirmation_sent_at,status").single();
  if (!insertResult.error) signup = insertResult.data;
  else if (insertResult.error.code === "23505") {
    duplicate = true;
    const existing = await supabase.from("waitlist").select("id,email,confirmation_sent_at,status").eq("email", email).maybeSingle();
    if (existing.error) return NextResponse.json({ error: "We couldn't check your signup. Please try again." }, { status: 500 });
    signup = existing.data;
  } else return NextResponse.json({ error: "We couldn't save your signup. Please try again." }, { status: 500 });

  if (!signup) return NextResponse.json({ error: "We couldn't save your signup. Please try again." }, { status: 500 });
  if (signup.confirmation_sent_at || signup.status === "unsubscribed") return NextResponse.json({ ok: true, duplicate: true });

  try {
    await sendWaitlistConfirmation(signup.email);
    const updated = await supabase.from("waitlist").update({ confirmation_sent_at: new Date().toISOString(), status: "confirmed" }).eq("id", signup.id);
    if (updated.error) return NextResponse.json({ error: "Your signup was saved, but we couldn't finish the confirmation. Please try again." }, { status: 502 });
  } catch (error) {
    console.error("waitlist confirmation failed", error);
    return NextResponse.json({ error: "Your signup was saved, but we couldn't send the confirmation. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, duplicate });
}
