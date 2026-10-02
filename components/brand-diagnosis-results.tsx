export type BrandDiagnosis = {
  current_signal: string;
  biggest_gap: string;
  strongest_opportunity: string;
  missing_proof: string;
  focus_next: string;
  next_best_move: string;
};

export default function BrandDiagnosisResults({ diagnosis, profile }: { diagnosis: BrandDiagnosis; profile?: LinkedInIdentity | null }) {
  return (
    <div className="clonao-diagnosis-results">
      <header className="clonao-diagnosis-results__header">
        {profile?.first_name ? <p className="clonao-diagnosis-results__greeting">Hey {profile.first_name},</p> : null}
        {profile && (profile.profile_image_url || profile.full_name || profile.headline) ? (
          <div className="clonao-diagnosis-identity">
            {profile.profile_image_url ? <img src={profile.profile_image_url} alt="" /> : null}
            <div><strong>{profile.full_name || ""}</strong>{profile.headline ? <span>{profile.headline}</span> : null}</div>
          </div>
        ) : null}
        <p className="clonao-analysis-kicker">Your Brand Diagnosis</p>
        <h2>Your brand, with a clearer next move.</h2>
        <p>Here’s what Clonao found based on where your brand is now and where you want it to go.</p>
      </header>
      <div className="clonao-diagnosis-results__sections">
        <article><h3>What you’re signaling now</h3><p>{diagnosis.current_signal}</p></article>
        <article><h3>Your biggest positioning gap</h3><p>{diagnosis.biggest_gap}</p></article>
        <article><h3>Your strongest opportunity</h3><p>{diagnosis.strongest_opportunity}</p></article>
        <article><h3>What’s missing</h3><p>{diagnosis.missing_proof}</p></article>
        <article><h3>What to focus on next</h3><p>{diagnosis.focus_next}</p></article>
        <article className="is-emphasis"><p className="clonao-diagnosis-results__eyebrow">Your next best move</p><p>{diagnosis.next_best_move}</p></article>
      </div>
    </div>
  );
}
import type { LinkedInIdentity } from "../lib/linkedin-profile";
