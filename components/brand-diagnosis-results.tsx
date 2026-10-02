export type BrandDiagnosis = {
  current_signal: string;
  biggest_gap: string;
  strongest_opportunity: string;
  missing_proof: string;
  focus_next: string;
  next_best_move: string;
};

export default function BrandDiagnosisResults({ diagnosis }: { diagnosis: BrandDiagnosis }) {
  return (
    <div className="clonao-diagnosis-results">
      <header className="clonao-diagnosis-results__header">
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
