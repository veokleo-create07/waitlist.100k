import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import { generateBrandDiagnosis } from "../../../lib/brand-diagnosis";

export const runtime = "nodejs";

type DiagnosisRequest = {
  result_token?: unknown;
  linkedin_url?: unknown;
  desired_positioning?: unknown;
  desired_outcome?: unknown;
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
  const desiredOutcome = text(body.desired_outcome ?? body.biggest_challenge, 1000);

  if (!resultToken || !validLinkedInUrl(linkedinUrl) || !desiredPositioning || !desiredOutcome) {
    return NextResponse.json({ error: "Please complete all three fields with a valid LinkedIn profile URL." }, { status: 400 });
  }

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch (error) {
    console.error("brand diagnosis service configuration failed", error);
    return NextResponse.json({ error: "The diagnosis service is not configured yet.", retryable: true }, { status: 503 });
  }

  const record = await supabase
    .from("waitlist")
    .update({
      linkedin_url: linkedinUrl,
      desired_positioning: desiredPositioning,
      biggest_challenge: desiredOutcome,
      diagnosis_status: "pending",
      diagnosis_json: null,
    })
    .eq("result_token", resultToken)
    .neq("status", "unsubscribed")
    .select("id")
    .maybeSingle();

  if (record.error) {
    console.error("brand diagnosis record update failed", record.error);
    return NextResponse.json({ error: "We couldn't save your diagnosis inputs. Please try again.", retryable: true }, { status: 500 });
  }
  if (!record.data) return NextResponse.json({ error: "This diagnosis link is no longer available." }, { status: 404 });

  const processing = await supabase.from("waitlist").update({ diagnosis_status: "processing" }).eq("id", record.data.id);
  if (processing.error) {
    console.error("brand diagnosis processing status update failed", processing.error);
    return NextResponse.json({ error: "We couldn't start your diagnosis. Please try again.", retryable: true }, { status: 503 });
  }

  try {
    const diagnosis = await generateBrandDiagnosis({ linkedinUrl, desiredPositioning, desiredOutcome });
    const completed = await supabase.from("waitlist").update({ diagnosis_json: diagnosis, diagnosis_status: "completed" }).eq("id", record.data.id).select("id").maybeSingle();
    if (completed.error || !completed.data) throw new Error("Could not save completed diagnosis.");
    return NextResponse.json({ ok: true, status: "completed", diagnosis });
  } catch (error) {
    console.error("brand diagnosis generation failed", error);
    const failed = await supabase.from("waitlist").update({ diagnosis_status: "failed" }).eq("id", record.data.id);
    if (failed.error) console.error("brand diagnosis failed status update failed", failed.error);
    return NextResponse.json({ error: "We couldn't complete your Brand Diagnosis. Please try again.", retryable: true }, { status: 502 });
  }
}
