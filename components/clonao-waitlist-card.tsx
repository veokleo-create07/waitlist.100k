"use client";

import { FormEvent, useRef, useState } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import { SendIcon, type SendIconHandle } from "./send-icon";

type Step = "entry" | "email" | "success";

export default function ClonaoWaitlistCard() {
  const [step, setStep] = useState<Step>("entry");
  const [status, setStatus] = useState<"idle" | "error" | "joining">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const sendIconRef = useRef<SendIconHandle>(null);

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
    sendIconRef.current?.startAnimation();
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
        sendIconRef.current?.stopAnimation();
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "We couldn't join you to the waitlist. Please try again.");
      });
  }

  return (
    <section className="clonao-waitlist-card" aria-live="polite">
      <div className="clonao-waitlist-card__content">
        <LazyMotion features={domAnimation} strict>
          <AnimatePresence mode="wait" initial={false}>
            {step === "entry" ? (
              <m.div key="entry" className="clonao-waitlist-card__state clonao-waitlist-card__entry" initial={{ opacity: 0, y: 8, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: .98 }} transition={{ type: "spring", stiffness: 280, damping: 26 }}>
                <button className="clonao-waitlist-card__entry-button" type="button" onClick={() => setStep("email")}>Join early access</button>
              </m.div>
            ) : null}

            {step === "email" ? (
              <m.div key="email" className="clonao-waitlist-card__state clonao-waitlist-card__email-state" initial={{ opacity: 0, y: 10, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: .98 }} transition={{ type: "spring", stiffness: 260, damping: 27 }}>
                <h2>Enter your email</h2>
                <form className="clonao-waitlist-card__form" onSubmit={submit} noValidate>
                  <label className="sr-only" htmlFor="waitlist-email">Email address</label>
                  <span className="clonao-waitlist-card__input-wrap">
                    <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 6.5h16v11H4z" /><path d="m4.5 7 7.5 6 7.5-6" /></svg>
                    <input ref={emailRef} id="waitlist-email" name="email" type="email" placeholder="Email address" autoComplete="email" required disabled={status === "joining"} value={email} onChange={(event) => { setEmail(event.target.value); setStatus("idle"); setErrorMessage(""); }} />
                  </span>
                  <button type="submit" disabled={status === "joining"}>{status === "joining" ? <><span>Joining</span><span className="clonao-waitlist-card__loading-dots" aria-hidden="true"><i /><i /><i /></span></> : <>Get early access <SendIcon ref={sendIconRef} size={20} duration={0.85} /></>}</button>
                </form>
                <p className="clonao-waitlist-card__consent">By joining, you agree to receive Clonao waitlist, early-access and launch emails. Unsubscribe anytime. <a href="/privacy">Privacy Policy</a>.</p>
                <p className={`clonao-waitlist-card__status${status === "error" ? " is-error" : ""}`} role="status">{status === "error" ? errorMessage : ""}</p>
              </m.div>
            ) : null}

            {step === "success" ? (
              <m.div key="success" className="clonao-waitlist-card__state clonao-waitlist-card__success" initial={{ opacity: 0, y: 10, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 240, damping: 25 }}>
                <m.svg className="clonao-waitlist-card__success-check" viewBox="0 0 24 24" fill="none" aria-hidden="true" initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .28, ease: "easeOut" }}>
                  <m.path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .52, delay: .1, ease: "easeOut" }} />
                </m.svg>
                <m.h2 initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16, duration: .3 }}>You’re in</m.h2>
                <m.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .23, duration: .34 }}>You’re officially on the Clonao early-access list.</m.p>
              </m.div>
            ) : null}
          </AnimatePresence>
        </LazyMotion>
      </div>
    </section>
  );
}
