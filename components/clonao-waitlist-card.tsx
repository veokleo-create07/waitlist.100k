"use client";

import { FormEvent, useRef, useState } from "react";
import type { MutableRefObject } from "react";

const SOUND_ENABLED = true;
type SoundKind = "typing" | "confirmation";
type SoundMap = Partial<Record<SoundKind, HTMLAudioElement>>;

const SOUND_SETTINGS = {
  typing: { duration: 0.045, volume: 0.4 },
  confirmation: { duration: 0.58, volume: 0.55 },
} satisfies Record<SoundKind, { duration: number; volume: number }>;

function createSound(kind: SoundKind) {
  const { duration } = SOUND_SETTINGS[kind];
  const sampleRate = 44100;
  const sampleCount = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + sampleCount * 2);
  const view = new DataView(buffer);
  const write = (offset: number, value: string) => [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  write(0, "RIFF"); view.setUint32(4, 36 + sampleCount * 2, true); write(8, "WAVE"); write(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); write(36, "data"); view.setUint32(40, sampleCount * 2, true);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    let sample = 0;
    if (kind === "typing") {
      const envelope = Math.min(1, time / 0.004) * Math.min(1, (duration - time) / 0.018);
      sample = Math.sin(time * 1220 * Math.PI * 2) * envelope * 0.44;
    } else {
      const attack = Math.min(1, time / 0.045);
      const tail = Math.exp(-time * 5.8);
      const warmTone = Math.sin(time * 285 * Math.PI * 2) * 0.58;
      const glassTone = time > 0.035 ? Math.sin((time - 0.035) * 860 * Math.PI * 2) * 0.4 : 0;
      const echo = time > 0.18 ? Math.sin((time - 0.18) * 860 * Math.PI * 2) * 0.08 : 0;
      sample = (warmTone + glassTone + echo) * attack * tail * 0.42;
    }
    view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, sample)) * 32767, true);
  }

  const audio = new Audio(URL.createObjectURL(new Blob([buffer], { type: "audio/wav" })));
  audio.preload = "auto";
  audio.volume = SOUND_SETTINGS[kind].volume;
  audio.load();
  return audio;
}

function playSound(kind: SoundKind, soundsRef: MutableRefObject<SoundMap>) {
  if (!SOUND_ENABLED || typeof window === "undefined") return;
  try {
    const audio = soundsRef.current[kind] ?? (soundsRef.current[kind] = createSound(kind));
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  } catch {
    // Sound is optional feedback and must never interfere with signup.
  }
}

type Step = "entry" | "email" | "success";

export default function ClonaoWaitlistCard() {
  const [step, setStep] = useState<Step>("entry");
  const [status, setStatus] = useState<"idle" | "error" | "joining">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const soundsRef = useRef<SoundMap>({});

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
        playSound("confirmation", soundsRef);
        setStatus("idle");
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
              <input ref={emailRef} id="waitlist-email" name="email" type="email" placeholder="Email address" autoComplete="email" required value={email} onKeyDown={(event) => { if (event.key.length === 1 || event.key === "Backspace" || event.key === "Delete") playSound("typing", soundsRef); }} onChange={(event) => { setEmail(event.target.value); setStatus("idle"); setErrorMessage(""); }} />
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
  );
}
