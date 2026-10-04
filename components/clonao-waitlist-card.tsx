"use client";

import { useRef, useState } from "react";
import type { FormEvent, MutableRefObject } from "react";

const SOUND_ENABLED = true;

type SoundKind = "click" | "focus" | "valid" | "success";

function playFeedbackSound(kind: SoundKind, contextRef: MutableRefObject<AudioContext | null>) {
  if (!SOUND_ENABLED || typeof window === "undefined" || !("AudioContext" in window)) return;

  try {
    const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;
    const context = contextRef.current ?? new AudioContextConstructor();
    contextRef.current = context;
    if (context.state === "suspended") void context.resume();

    const settings = {
      click: { frequency: 420, duration: 0.12, volume: 0.2, type: "sine" as OscillatorType },
      focus: { frequency: 620, duration: 0.16, volume: 0.16, type: "sine" as OscillatorType },
      valid: { frequency: 920, duration: 0.13, volume: 0.18, type: "sine" as OscillatorType },
      success: { frequency: 520, duration: 0.62, volume: 0.22, type: "sine" as OscillatorType },
    }[kind];
    const schedule = () => {
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = settings.type;
      oscillator.frequency.setValueAtTime(settings.frequency, now);
      if (kind === "success") oscillator.frequency.exponentialRampToValueAtTime(780, now + settings.duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(settings.volume, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + settings.duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + settings.duration + 0.02);
    };

    if (context.state === "suspended") {
      void context.resume().then(schedule).catch(() => undefined);
    } else {
      schedule();
    }
  } catch {
    // Audio is optional feedback and must never interfere with the signup flow.
  }
}

type Step = "entry" | "email" | "success";

export default function ClonaoWaitlistCard() {
  const [step, setStep] = useState<Step>("entry");
  const [status, setStatus] = useState<"idle" | "error" | "joining">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const focusSoundPlayedRef = useRef(false);
  const validSoundPlayedRef = useRef(false);

  function pressAndRun(action: () => void) {
    setIsPressed(true);
    window.setTimeout(() => setIsPressed(false), 180);
    action();
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
        playFeedbackSound("success", audioContextRef);
        setStatus("idle");
        setStep("success");
      })
      .catch((error: unknown) => {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "We couldn't join you to the waitlist. Please try again.");
      });
  }

  return (
    <section className={`clonao-waitlist-card${step === "success" ? " is-success" : ""}`} aria-live="polite">
      <div className="clonao-waitlist-card__content">
        {step === "entry" ? <>
          <h2>Join Clonao early access</h2>
          <button className={`clonao-waitlist-card__entry-button${isPressed ? " is-pressed" : ""}`} type="button" onClick={() => pressAndRun(() => { playFeedbackSound("click", audioContextRef); setStep("email"); })}>Join early access</button>
        </> : null}

        {step === "email" ? <>
          <h2>Enter your email</h2>
          <form className="clonao-waitlist-card__form" onSubmit={submit} noValidate>
            <label className="sr-only" htmlFor="waitlist-email">Email address</label>
            <span className={`clonao-waitlist-card__input-wrap${emailFocused ? " is-focused" : ""}${emailValid ? " is-valid" : ""}`}>
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 6.5h16v11H4z" /><path d="m4.5 7 7.5 6 7.5-6" /></svg>
              <input ref={emailRef} id="waitlist-email" name="email" type="email" placeholder="Email address" autoComplete="email" required value={email} onFocus={() => { setEmailFocused(true); if (!focusSoundPlayedRef.current) { focusSoundPlayedRef.current = true; playFeedbackSound("focus", audioContextRef); } }} onBlur={() => setEmailFocused(false)} onChange={(event) => { const nextEmail = event.target.value; const nextIsValid = event.currentTarget.checkValidity(); setEmail(nextEmail); setEmailValid(nextIsValid); setStatus("idle"); setErrorMessage(""); if (nextIsValid && !validSoundPlayedRef.current) { validSoundPlayedRef.current = true; playFeedbackSound("valid", audioContextRef); } if (!nextIsValid) validSoundPlayedRef.current = false; }} />
              <span className="clonao-waitlist-card__valid-mark" aria-hidden="true">✓</span>
            </span>
            <button className={status === "joining" ? "is-joining" : ""} type="submit" disabled={status === "joining"}>{status === "joining" ? "Joining…" : "Get early access"}</button>
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
  );
}
