"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Step = "entry" | "email" | "success";
type TransportPhase = "idle" | "sending" | "receiving";

export default function ClonaoWaitlistCard() {
  const [step, setStep] = useState<Step>("entry");
  const [status, setStatus] = useState<"idle" | "error" | "joining">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [transportPhase, setTransportPhase] = useState<TransportPhase>("idle");
  const emailRef = useRef<HTMLInputElement>(null);
  const apiSucceededRef = useRef(false);
  const transportFinishedRef = useRef(false);
  const transportTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (transportTimerRef.current !== null) window.clearTimeout(transportTimerRef.current);
  }, []);

  function completeAfterTransport() {
    if (apiSucceededRef.current && transportFinishedRef.current) {
      setTransportPhase("idle");
      setStatus("idle");
      setStep("success");
    }
  }

  function startTransport() {
    apiSucceededRef.current = false;
    transportFinishedRef.current = false;
    setTransportPhase("sending");
    transportTimerRef.current = window.setTimeout(() => {
      setTransportPhase("receiving");
      transportTimerRef.current = window.setTimeout(() => {
        transportFinishedRef.current = true;
        completeAfterTransport();
      }, 520);
    }, 1050);
  }

  function stopTransport() {
    if (transportTimerRef.current !== null) window.clearTimeout(transportTimerRef.current);
    transportTimerRef.current = null;
    apiSucceededRef.current = false;
    transportFinishedRef.current = false;
    setTransportPhase("idle");
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
    startTransport();
    void fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "hero-waitlist" }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || "We couldn't join you to the waitlist. Please try again.");
        apiSucceededRef.current = true;
        completeAfterTransport();
      })
      .catch((error: unknown) => {
        stopTransport();
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "We couldn't join you to the waitlist. Please try again.");
      });
  }

  return (
    <section className="clonao-waitlist-card" aria-live="polite">
      {transportPhase !== "idle" ? <div className={`clonao-transmission clonao-transmission--${transportPhase}`} aria-hidden="true">
        <svg className="clonao-transmission__route" viewBox="0 0 740 180" preserveAspectRatio="none">
          <path className="clonao-transmission__track" d="M86 126 C220 126 300 44 450 66 C526 77 574 92 634 88" />
          <path className="clonao-transmission__trace" d="M86 126 C220 126 300 44 450 66 C526 77 574 92 634 88" />
          {transportPhase === "sending" ? <circle className="clonao-transmission__point" r="5">
            <animateMotion dur="1.05s" fill="freeze" path="M86 126 C220 126 300 44 450 66 C526 77 574 92 634 88" />
          </circle> : null}
        </svg>
        <div className="clonao-transmission__orb">
          <span className="clonao-transmission__orb-ring clonao-transmission__orb-ring--outer" />
          <span className="clonao-transmission__orb-ring clonao-transmission__orb-ring--inner" />
          <img src="/clonao-logo.png" alt="" />
        </div>
      </div> : null}
      <div className="clonao-waitlist-card__content">
        {step === "entry" ? <>
          <h2>Join Clonao early access</h2>
          <button className="clonao-waitlist-card__entry-button" type="button" onClick={() => setStep("email")}>Join early access</button>
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
          <h2>You’re in.</h2>
          <p>You’re officially on the Clonao early-access list.</p>
          <p>We’ll send you an access invitation when Clonao is ready.</p>
        </div> : null}
      </div>
    </section>
  );
}
