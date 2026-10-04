"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Step = "entry" | "email" | "success";

export default function ClonaoWaitlistCard() {
  const [step, setStep] = useState<Step>("entry");
  const [status, setStatus] = useState<"idle" | "error" | "joining">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const portal = portalRef.current;
    if (!portal) return;
    const onPointerMove = (event: PointerEvent) => {
      const bounds = portal.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      portal.style.setProperty("--portal-mx", `${Math.max(-1, Math.min(1, x)) * 7}px`);
      portal.style.setProperty("--portal-my", `${Math.max(-1, Math.min(1, y)) * 5}px`);
    };
    const onPointerLeave = () => {
      portal.style.setProperty("--portal-mx", "0px");
      portal.style.setProperty("--portal-my", "0px");
    };
    portal.addEventListener("pointermove", onPointerMove);
    portal.addEventListener("pointerleave", onPointerLeave);
    return () => {
      portal.removeEventListener("pointermove", onPointerMove);
      portal.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

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
        setStatus("idle");
        setStep("success");
      })
      .catch((error: unknown) => {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "We couldn't join you to the waitlist. Please try again.");
      });
  }

  return (
    <div className="clonao-portal-stage" ref={portalRef}>
      <span className="clonao-portal-orbit" aria-hidden="true" />
      <span className="clonao-portal-bubble clonao-portal-bubble--one" aria-hidden="true" />
      <span className="clonao-portal-bubble clonao-portal-bubble--two" aria-hidden="true" />
      <span className="clonao-portal-bubble clonao-portal-bubble--three" aria-hidden="true" />
      <section className="clonao-waitlist-card" aria-live="polite">
        <img className="clonao-portal-image" src="https://i.postimg.cc/9XDFDLhc/Sunlit-Canopy-Framing-Blue-Skies.png" alt="" aria-hidden="true" />
        <span className="clonao-portal-glass" aria-hidden="true" />
        <div className="clonao-waitlist-card__content">
        {step === "entry" ? <>
          <h2>Join Clonao early access</h2>
          <p className="clonao-waitlist-card__subline">We’ll send you an access invitation when Clonao is ready.</p>
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
        </div> : null}
        </div>
      </section>
    </div>
  );
}
