import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";

export const runtime = "nodejs";

type DiagnosisRequest = {
  result_token?: unknown;
  linkedin_url?: unknown;
  desired_positioning?: unknown;
  biggest_challenge?: unknown;
};

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validLinkedInUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "linkedin.com" || url.hostname.endsWith(".linkedin.com")) && url.pathname.length > 1;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: DiagnosisRequest;
  try { body = await request.json() as DiagnosisRequest; } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const resultToken = text(body.result_token, 200);
  const linkedinUrl = text(body.linkedin_url, 500);
  const desiredPositioning = text(body.desired_positioning, 500);
  const biggestChallenge = text(body.biggest_challenge, 1000);

  if (!resultToken || !validLinkedInUrl(linkedinUrl) || !desiredPositioning || !biggestChallenge) {
    return NextResponse.json({ error: "Please complete all three fields with a valid LinkedIn profile URL." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const result = await supabase
      .from("waitlist")
      .update({
        linkedin_url: linkedinUrl,
        desired_positioning: desiredPositioning,
        biggest_challenge: biggestChallenge,
        diagnosis_status: "completed",
        diagnosis_json: { linkedin_url: linkedinUrl, desired_positioning: desiredPositioning, biggest_challenge: biggestChallenge },
      })
      .eq("result_token", resultToken)
      .neq("status", "unsubscribed")
      .select("id")
      .maybeSingle();

    if (result.error) throw result.error;
    if (!result.data) return NextResponse.json({ error: "This diagnosis link is no longer available." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("brand diagnosis submission failed", error);
    return NextResponse.json({ error: "We couldn't save your diagnosis. Please try again." }, { status: 500 });
  }
}
