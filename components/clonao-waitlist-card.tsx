"use client";

import { FormEvent, useRef, useState } from "react";

type Step = "entry" | "diagnosis" | "email" | "success";
type DiagnosisStep = 1 | 2 | 3;

export default function ClonaoWaitlistCard() {
  const [step, setStep] = useState<Step>("entry");
  const [diagnosisStep, setDiagnosisStep] = useState<DiagnosisStep>(1);
  const [status, setStatus] = useState<"idle" | "error" | "joining">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [desiredPositioning, setDesiredPositioning] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  function beginDiagnosis() {
    setErrorMessage("");
    setStep("diagnosis");
  }

  function continueDiagnosis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    if (diagnosisStep < 3) {
      setDiagnosisStep((diagnosisStep + 1) as DiagnosisStep);
    } else {
      setStep("email");
    }
  }

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

        if (!payload.diagnosis_token) {
          setStep("success");
          return;
        }

        const diagnosisResponse = await fetch("/api/diagnosis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ result_token: payload.diagnosis_token, linkedin_url: linkedinUrl, desired_positioning: desiredPositioning, biggest_challenge: desiredOutcome }),
        });
        const diagnosisPayload = await diagnosisResponse.json().catch(() => ({}));
        if (!diagnosisResponse.ok) throw new Error(diagnosisPayload.error || "Your signup was saved, but we couldn't save your diagnosis. Please try again.");
        setStep("success");
      })
      .catch((error: unknown) => {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "We couldn't join you to the waitlist. Please try again.");
      });
  }

  return (
    <section className="clonao-waitlist-card" aria-live="polite">
      <div className="clonao-waitlist-card__content">
        {step === "success" ? (
          <div className="clonao-waitlist-card__success">
            <h2>You’re in early access.</h2>
            <p>Your answers are saved for your free Brand Diagnosis. We’ll let you know when Clonao launches.</p>
          </div>
        ) : step === "entry" ? (
          <>
            <h2>Join Clonao early access</h2>
            <p className="clonao-waitlist-card__subline">Get a free Brand Diagnosis while we build — and be first in line when Clonao launches.</p>
            <button className="clonao-waitlist-card__entry-button" type="button" onClick={beginDiagnosis}>Join early access</button>
          </>
        ) : step === "diagnosis" ? (
          <>
            <div className="clonao-waitlist-card__progress" aria-label={`Brand Diagnosis step ${diagnosisStep} of 3`}>
              {[1, 2, 3].map((item) => <span key={item} className={item <= diagnosisStep ? "is-active" : ""} />)}
              <span className="clonao-waitlist-card__progress-label">{diagnosisStep} of 3</span>
            </div>
            <div className="clonao-waitlist-card__question" key={diagnosisStep}>
              <h2>Get your free Brand Diagnosis</h2>
              <p className="clonao-waitlist-card__subline">Answer three quick questions while Clonao is still in early access.</p>
              <form className="clonao-waitlist-card__diagnosis-form" onSubmit={continueDiagnosis}>
                {diagnosisStep === 1 ? <><label htmlFor="linkedin-url">LinkedIn profile URL</label><input id="linkedin-url" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/your-name" required value={linkedinUrl} onChange={(event) => { setLinkedinUrl(event.target.value); setErrorMessage(""); }} /></> : null}
                {diagnosisStep === 2 ? <><label htmlFor="desired-positioning">What do you want to be known for?</label><input id="desired-positioning" name="desired_positioning" type="text" placeholder="Your point of view, expertise, or edge" required value={desiredPositioning} onChange={(event) => { setDesiredPositioning(event.target.value); setErrorMessage(""); }} /></> : null}
                {diagnosisStep === 3 ? <><label htmlFor="desired-outcome">What do you want your personal brand to help you achieve?</label><input id="desired-outcome" name="desired_outcome" type="text" placeholder="The outcome you want to create" required value={desiredOutcome} onChange={(event) => { setDesiredOutcome(event.target.value); setErrorMessage(""); }} /></> : null}
                <button type="submit">{diagnosisStep === 3 ? "Continue →" : "Continue"}</button>
              </form>
            </div>
          </>
        ) : (
          <>
            <h2>Join Clonao early access</h2>
            <p className="clonao-waitlist-card__subline">Enter your email to get notified when Clonao launches.</p>
            <form className="clonao-waitlist-card__form" onSubmit={submit} noValidate>
              <label className="sr-only" htmlFor="waitlist-email">Email address</label>
              <span className="clonao-waitlist-card__input-wrap">
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 6.5h16v11H4z" /><path d="m4.5 7 7.5 6 7.5-6" /></svg>
                <input ref={emailRef} id="waitlist-email" name="email" type="email" placeholder="Email address" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); setStatus("idle"); setErrorMessage(""); }} />
              </span>
              <button type="submit" disabled={status === "joining"}>{status === "joining" ? "Joining…" : "Join early access"}</button>
            </form>
            <p className="clonao-waitlist-card__consent">By joining, you agree to receive Clonao waitlist, early-access and launch emails. Unsubscribe anytime. <a href="/privacy">Privacy Policy</a>.</p>
            <p className={`clonao-waitlist-card__status${status === "error" ? " is-error" : ""}`} role="status">{status === "error" ? errorMessage : ""}</p>
          </>
        )}
      </div>
    </section>
  );
}
