import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase-admin";

export const runtime = "nodejs";

const allowed = {
  audience_type: ["Founder", "Consultant", "Creator", "Freelancer", "Executive", "Other"],
  brand_goal: ["Generate clients", "Build authority", "Grow an audience", "Get opportunities", "Launch something", "Other"],
  personalization_challenge: ["Knowing what to post", "Clear positioning", "Standing out", "Consistency", "Growth", "Knowing what to focus on"],
} as const;

type Body = { result_token?: unknown; audience_type?: unknown; brand_goal?: unknown; personalization_challenge?: unknown };

function value(input: unknown) { return typeof input === "string" ? input.trim() : ""; }

export async function POST(request: Request) {
  let body: Body;
  try { body = await request.json() as Body; } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const resultToken = value(body.result_token);
  const audienceType = value(body.audience_type);
  const brandGoal = value(body.brand_goal);
  const challenge = value(body.personalization_challenge);
  if (!/^[a-f0-9]{64}$/i.test(resultToken) || !allowed.audience_type.includes(audienceType as never) || !allowed.brand_goal.includes(brandGoal as never) || !allowed.personalization_challenge.includes(challenge as never)) {
    return NextResponse.json({ error: "Please select an answer for each question." }, { status: 400 });
  }
  try {
    const supabase = getSupabaseAdmin();
    const result = await supabase.from("waitlist").update({ audience_type: audienceType, brand_goal: brandGoal, personalization_challenge: challenge }).eq("result_token", resultToken).neq("status", "unsubscribed").select("id").maybeSingle();
    if (result.error || !result.data) {
      console.error("waitlist personalization save failed", result.error);
      return NextResponse.json({ error: "We couldn't save your preferences. Please try again." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("waitlist personalization service failed", error);
    return NextResponse.json({ error: "The waitlist service is not configured yet." }, { status: 503 });
  }
}
