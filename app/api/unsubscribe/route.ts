import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";
import { verifyUnsubscribeToken } from "../../../lib/unsubscribe";

export const runtime = "nodejs";

async function unsubscribe(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const email = verifyUnsubscribeToken(token);
  if (!email) return { ok: false as const, status: 400 };

  try {
    const supabase = getSupabaseAdmin();
    const result = await supabase.from("waitlist").update({ status: "unsubscribed" }).eq("email", email);
    if (result.error) throw result.error;
    return { ok: true as const };
  } catch (error) {
    console.error("waitlist unsubscribe failed", error);
    return { ok: false as const, status: 500 };
  }
}

export async function GET(request: Request) {
  const result = await unsubscribe(request);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://clonao.com").replace(/\/$/, "");
  const status = result.ok ? "success" : result.status === 400 ? "invalid" : "error";
  return NextResponse.redirect(`${siteUrl}/unsubscribe?status=${status}`, 303);
}

export async function POST(request: Request) {
  const result = await unsubscribe(request);
  return new NextResponse(null, { status: result.ok ? 204 : result.status });
}
