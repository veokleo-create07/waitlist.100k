"use client";

import { FormEvent, useRef, useState } from "react";

export default function ClonaoWaitlistCard() {
  const [status, setStatus] = useState<"idle" | "error" | "joining" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
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
        setStatus("success");
      })
      .catch((error: unknown) => {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "We couldn't join you to the waitlist. Please try again.");
      });
  }

  return (
    <section className="clonao-waitlist-card" aria-live="polite">
      <div className="clonao-waitlist-card__content">
        <a className="clonao-waitlist-card__brand" href="#top" aria-label="Clonao home">
          <img src="/clonao-logo.png" alt="" aria-hidden="true" />
          <span>Clonao</span>
        </a>
        {status === "success" ? (
          <div className="clonao-waitlist-card__success">
            <h2>You’re on the list.</h2>
            <p>We’ll let you know when Clonao is ready.</p>
          </div>
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
