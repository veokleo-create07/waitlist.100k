"use client";

import { FormEvent, useRef, useState } from "react";

export default function ClonaoWaitlistCard() {
  const [step, setStep] = useState<"waitlist" | "diagnosis" | "success">("waitlist");
  const [status, setStatus] = useState<"idle" | "error" | "joining">("idle");
  const [diagnosisStatus, setDiagnosisStatus] = useState<"idle" | "error" | "saving">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [diagnosisToken, setDiagnosisToken] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [desiredPositioning, setDesiredPositioning] = useState("");
  const [biggestChallenge, setBiggestChallenge] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailRef.current?.checkValidity()) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      emailRef.current?.focus();
      return;
    }

    setStatus("joining");
    setErrorMessage("");
    void fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "hero-waitlist" }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "We couldn't join you to the waitlist. Please try again.");
        if (payload.diagnosis_token) {
          setDiagnosisToken(payload.diagnosis_token);
          setStep("diagnosis");
        } else {
          setStep("success");
        }
      })
      .catch((error: unknown) => {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "We couldn't join you to the waitlist. Please try again.");
      });
  }

  function submitDiagnosis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDiagnosisStatus("saving");
    setErrorMessage("");
    void fetch("/api/diagnosis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result_token: diagnosisToken, linkedin_url: linkedinUrl, desired_positioning: desiredPositioning, biggest_challenge: biggestChallenge }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "We couldn't save your diagnosis. Please try again.");
        setStep("success");
      })
      .catch((error: unknown) => {
        setDiagnosisStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "We couldn't save your diagnosis. Please try again.");
      });
  }

  return (
    <section className="clonao-waitlist-card" aria-live="polite">
      <div className="clonao-waitlist-card__content">
        {step === "success" ? (
          <div className="clonao-waitlist-card__success">
            <h2>You’re on the list.</h2>
            <p>We’ll let you know when Clonao is ready.</p>
          </div>
        ) : step === "diagnosis" ? (
          <>
            <h2>Build your diagnosis</h2>
            <p className="clonao-waitlist-card__subline">Help us understand where you want to go next.</p>
            <form className="clonao-waitlist-card__diagnosis-form" onSubmit={submitDiagnosis}>
              <label htmlFor="linkedin-url">LinkedIn profile URL</label>
              <input id="linkedin-url" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/your-name" required value={linkedinUrl} onChange={(event) => { setLinkedinUrl(event.target.value); setDiagnosisStatus("idle"); setErrorMessage(""); }} />
              <label htmlFor="desired-positioning">What do you want to be known for?</label>
              <textarea id="desired-positioning" name="desired_positioning" rows={2} placeholder="Your point of view, expertise, or edge" required value={desiredPositioning} onChange={(event) => { setDesiredPositioning(event.target.value); setDiagnosisStatus("idle"); setErrorMessage(""); }} />
              <label htmlFor="biggest-challenge">What is your biggest challenge right now?</label>
              <textarea id="biggest-challenge" name="biggest_challenge" rows={2} placeholder="What feels hardest about building your personal brand?" required value={biggestChallenge} onChange={(event) => { setBiggestChallenge(event.target.value); setDiagnosisStatus("idle"); setErrorMessage(""); }} />
              <button type="submit" disabled={diagnosisStatus === "saving"}>{diagnosisStatus === "saving" ? "Saving…" : "Continue →"}</button>
            </form>
            <p className={`clonao-waitlist-card__status${diagnosisStatus === "error" ? " is-error" : ""}`} role="status">{diagnosisStatus === "error" ? errorMessage : ""}</p>
          </>
        ) : (
          <>
            <h2>Get early access</h2>
            <p className="clonao-waitlist-card__subline">Be the first to try Clonao when we launch.</p>
            <form className="clonao-waitlist-card__form" onSubmit={submit} noValidate>
              <label className="sr-only" htmlFor="waitlist-email">Email address</label>
              <span className="clonao-waitlist-card__input-wrap">
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 6.5h16v11H4z" /><path d="m4.5 7 7.5 6 7.5-6" /></svg>
                <input ref={emailRef} id="waitlist-email" name="email" type="email" placeholder="Email address" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); setStatus("idle"); setErrorMessage(""); }} />
              </span>
              <button type="submit" disabled={status === "joining"}>{status === "joining" ? "Joining…" : "Join the waitlist →"}</button>
            </form>
            <p className="clonao-waitlist-card__consent">By joining, you agree to receive Clonao waitlist, early-access and launch emails. Unsubscribe anytime. <a href="/privacy">Privacy Policy</a>.</p>
            <p className={`clonao-waitlist-card__status${status === "error" ? " is-error" : ""}`} role="status">{status === "error" ? errorMessage : ""}</p>
          </>
        )}
      </div>
    </section>
  );
}
