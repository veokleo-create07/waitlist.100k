export type BrandDiagnosis = {
  current_signal: string;
  biggest_gap: string;
  strongest_opportunity: string;
  missing_proof: string;
  focus_next: string;
  next_best_move: string;
};

const diagnosisSchema = {
  type: "object",
  additionalProperties: false,
  required: ["current_signal", "biggest_gap", "strongest_opportunity", "missing_proof", "focus_next", "next_best_move"],
  properties: {
    current_signal: { type: "string" },
    biggest_gap: { type: "string" },
    strongest_opportunity: { type: "string" },
    missing_proof: { type: "string" },
    focus_next: { type: "string" },
    next_best_move: { type: "string" },
  },
} as const;

const systemPrompt = `You are Clonao's Brand Diagnosis engine. Generate a concise, specific diagnosis from the user's supplied inputs and any reliably extracted public LinkedIn metadata.

Rules:
- Compare where the brand appears to be now with where the user wants it to go, then explain the missing bridge.
- Only treat supplied LinkedIn metadata as observed when it is present. Do not claim to have viewed profile posts, experience, audience, or proof unless that exact information is supplied.
- Compare the supplied profile context with the user's desired positioning and outcome. If the headline and goal point in different directions, explicitly identify that mismatch.
- Treat the user's positioning, desired outcome, and extracted profile fields as observed information. Clearly label reasonable conclusions as "Inference:" and observed inputs as "Observed:" when relevant.
- Never invent proof, experience, credentials, clients, results, audience, or industry authority.
- Avoid generic advice, motivational filler, and vague recommendations such as posting more consistently.
- Keep every field concise: one or two sentences, with no markdown lists.
- next_best_move must be one concrete action the user can execute within the next 24–48 hours, tied directly to the supplied positioning and desired outcome.

Return only the requested structured object.`;

function isBrandDiagnosis(value: unknown): value is BrandDiagnosis {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return Object.keys(diagnosisSchema.properties).every((key) => typeof record[key] === "string" && record[key].trim().length > 0 && record[key].length <= 1200);
}

export async function generateBrandDiagnosis(input: { linkedinUrl: string; desiredPositioning: string; desiredOutcome: string; profile?: LinkedInIdentity }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY.");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify({ linkedin_profile_url: input.linkedinUrl, linkedin_profile_context: input.profile || { profile_url: input.linkedinUrl }, wants_to_be_known_for: input.desiredPositioning, wants_brand_to_help_achieve: input.desiredOutcome }) },
      ],
      response_format: { type: "json_schema", json_schema: { name: "brand_diagnosis", strict: true, schema: diagnosisSchema } },
    }),
  });

  if (!response.ok) throw new Error(`OpenAI generation failed with status ${response.status}.`);
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string | null } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned an empty diagnosis.");

  let parsed: unknown;
  try { parsed = JSON.parse(content); } catch { throw new Error("OpenAI returned invalid diagnosis JSON."); }
  if (!isBrandDiagnosis(parsed)) throw new Error("OpenAI returned an invalid diagnosis shape.");
  return parsed;
}
import type { LinkedInIdentity } from "./linkedin-profile";
