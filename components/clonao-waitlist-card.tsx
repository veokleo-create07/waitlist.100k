"use client";

import { FormEvent, useRef, useState } from "react";

type Step = "entry" | "email" | "success" | "skipped" | "personalize" | "questions" | "profile-ready";
type QuestionKey = "persona_type" | "brand_goal" | "main_challenge";

const questions: Array<{ key: QuestionKey; label: string; options: string[] }> = [
  { key: "persona_type", label: "What best describes you?", options: ["Founder", "Consultant", "Creator", "Freelancer", "Executive", "Other"] },
  { key: "brand_goal", label: "What do you want your personal brand to help you achieve?", options: ["Generate clients", "Build authority", "Grow an audience", "Get opportunities", "Launch something", "Other"] },
  { key: "main_challenge", label: "What’s your biggest challenge right now?", options: ["Knowing what to post", "Clear positioning", "Standing out", "Consistency", "Growth", "Knowing what to focus on"] },
];

export default function ClonaoWaitlistCard() {
  const [step, setStep] = useState<Step>("entry");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "error" | "joining" | "saving">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resultToken, setResultToken] = useState("");
  const [answers, setAnswers] = useState<Record<QuestionKey, string>>({ persona_type: "", brand_goal: "", main_challenge: "" });
  const emailRef = useRef<HTMLInputElement>(null);

  function openEmailStep() { setErrorMessage(""); setStep("email"); }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailRef.current?.checkValidity()) {
      setStatus("error"); setErrorMessage("Please enter a valid email address."); emailRef.current?.focus(); return;
    }
    setStatus("joining"); setErrorMessage("");
    void fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source: "hero-waitlist" }) })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "We couldn't join you to the waitlist. Please try again.");
        setResultToken(payload.diagnosis_token || ""); setStatus("idle"); setStep("success");
      })
      .catch((error: unknown) => { setStatus("error"); setErrorMessage(error instanceof Error ? error.message : "We couldn't join you to the waitlist. Please try again."); });
  }

  function chooseAnswer(value: string) {
    const question = questions[questionIndex];
    const nextAnswers = { ...answers, [question.key]: value };
    setAnswers(nextAnswers); setErrorMessage("");
    if (questionIndex < questions.length - 1) { setQuestionIndex((index) => index + 1); return; }
    if (!resultToken) { setStep("profile-ready"); return; }
    setStatus("saving");
    void fetch("/api/waitlist/personalize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ result_token: resultToken, ...nextAnswers }) })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "We couldn't save your preferences. Please try again.");
        setStatus("idle"); setStep("profile-ready");
      })
      .catch((error: unknown) => { setStatus("error"); setErrorMessage(error instanceof Error ? error.message : "We couldn't save your preferences. Please try again."); });
  }

  const selectedQuestion = questions[questionIndex];
  return (
    <section className="clonao-waitlist-card" aria-live="polite">
      <div className="clonao-waitlist-card__content">
        {step === "entry" ? <>
          <h2>Join Clonao early access</h2>
          <p className="clonao-waitlist-card__subline">Get product previews, founder updates, and first access when Clonao launches.</p>
          <button className="clonao-waitlist-card__entry-button" type="button" onClick={openEmailStep}>Join early access</button>
        </> : null}

        {step === "email" ? <>
          <h2>Enter your email</h2>
          <form className="clonao-waitlist-card__form" onSubmit={submit} noValidate>
            <label className="sr-only" htmlFor="waitlist-email">Email address</label>
            <span className="clonao-waitlist-card__input-wrap">
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 6.5h16v11H4z" /><path d="m4.5 7 7.5 6 7.5-6" /></svg>
              <input ref={emailRef} id="waitlist-email" name="email" type="email" placeholder="Email address" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); setStatus("idle"); setErrorMessage(""); }} />
            </span>
            <button type="submit" disabled={status === "joining"}>{status === "joining" ? "Joining…" : "Get early access"}</button>
          </form>
          <p className="clonao-waitlist-card__consent">By joining, you agree to receive Clonao waitlist, early-access and launch emails. Unsubscribe anytime. <a href="/privacy">Privacy Policy</a>.</p>
          <p className={`clonao-waitlist-card__status${status === "error" ? " is-error" : ""}`} role="status">{status === "error" ? errorMessage : ""}</p>
        </> : null}

        {step === "success" ? <div className="clonao-waitlist-card__success">
          <h2>You’re in.</h2><p>You’re officially on the Clonao early access list.</p><p>We’ll send you an access invitation when Clonao is ready.</p>
          <p className="clonao-waitlist-card__success-prompt">Want to personalize your early access?</p>
          <button className="clonao-waitlist-card__entry-button" type="button" onClick={() => { setQuestionIndex(0); setStep("personalize"); }}>Personalize my experience</button>
          <button className="clonao-waitlist-card__text-button" type="button" onClick={() => setStep("skipped")}>Skip for now</button>
        </div> : null}

        {step === "personalize" ? <div className="clonao-waitlist-card__personalize">
          <h2>Personalize your early access.</h2><p className="clonao-waitlist-card__subline">Three quick answers help us make the build more relevant to you.</p>
          <button className="clonao-waitlist-card__entry-button" type="button" onClick={() => setStep("questions")}>Continue</button>
        </div> : null}

        {step === "questions" ? <div className="clonao-waitlist-card__personalize">
          <div className="clonao-waitlist-card__progress" aria-label={`Personalization question ${questionIndex + 1} of ${questions.length}`}>
            {questions.map((question, index) => <span key={question.key} className={index <= questionIndex ? "is-active" : ""} />)}<span className="clonao-waitlist-card__progress-label">{questionIndex + 1} of {questions.length}</span>
          </div>
          <h2>{selectedQuestion.label}</h2>
          <div className="clonao-waitlist-card__options" role="listbox" aria-label={selectedQuestion.label}>
            {selectedQuestion.options.map((option) => <button key={option} type="button" disabled={status === "saving"} className={answers[selectedQuestion.key] === option ? "is-selected" : ""} onClick={() => chooseAnswer(option)}>{option}</button>)}
          </div>
          <button className="clonao-waitlist-card__text-button clonao-waitlist-card__back-button" type="button" disabled={status === "saving"} onClick={() => { setErrorMessage(""); setQuestionIndex((index) => Math.max(0, index - 1)); }}>Back</button>
          {status === "saving" ? <p className="clonao-waitlist-card__status" role="status">Saving your preferences…</p> : null}
          {status === "error" ? <p className="clonao-waitlist-card__status is-error" role="status">{errorMessage}</p> : null}
        </div> : null}

        {step === "profile-ready" ? <div className="clonao-waitlist-card__success">
          <h2>Your early-access profile is ready.</h2>
          {answers.brand_goal && answers.main_challenge ? <p>You want to {answers.brand_goal.toLowerCase()}, and your biggest challenge right now is {answers.main_challenge.toLowerCase()}.</p> : <p>You’re on the Clonao early-access list. We’ll keep you close to the build.</p>}
          <p className="clonao-waitlist-card__success-prompt">We’ll keep you updated as Clonao gets closer to launch.</p><p>Expect product previews, founder updates, feature decisions, and your access invitation by email.</p>
        </div> : null}

        {step === "skipped" ? <div className="clonao-waitlist-card__success">
          <h2>You’re in.</h2>
          <p>You’re officially on the Clonao early access list.</p>
          <p>We’ll send you an access invitation when Clonao is ready.</p>
          <p className="clonao-waitlist-card__success-prompt">We’ll keep you updated as Clonao gets closer to launch.</p>
          <p>Expect product previews, founder updates, feature decisions, and your access invitation by email.</p>
        </div> : null}
      </div>
    </section>
  );
}
