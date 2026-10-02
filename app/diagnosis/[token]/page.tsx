import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrandDiagnosisResults, { BrandDiagnosis } from "../../../components/brand-diagnosis-results";
import { getSupabaseAdmin } from "../../../lib/supabase-admin";

type PageProps = { params: Promise<{ token: string }> };

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Brand Diagnosis — Clonao",
  description: "Your personalized Clonao Brand Diagnosis.",
};

function isBrandDiagnosis(value: unknown): value is BrandDiagnosis {
  if (!value || typeof value !== "object") return false;
  return ["current_signal", "biggest_gap", "strongest_opportunity", "missing_proof", "focus_next", "next_best_move"]
    .every((key) => typeof (value as Record<string, unknown>)[key] === "string");
}

export default async function DiagnosisPage({ params }: PageProps) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/i.test(token)) notFound();

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    notFound();
  }

  const { data, error } = await supabase
    .from("waitlist")
    .select("diagnosis_status,diagnosis_json")
    .eq("result_token", token)
    .maybeSingle();

  if (error || !data || data.diagnosis_status !== "completed" || !isBrandDiagnosis(data.diagnosis_json)) notFound();

  return (
    <main className="diagnosis-page">
      <div className="diagnosis-page__shell">
        <BrandDiagnosisResults diagnosis={data.diagnosis_json} />
      </div>
    </main>
  );
}
