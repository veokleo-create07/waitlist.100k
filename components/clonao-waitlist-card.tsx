"use client";

import { useRef, useState } from "react";
import type { FormEvent, MutableRefObject } from "react";

const SOUND_ENABLED = true;

type SoundKind = "click" | "focus" | "valid" | "success";

const SOUND_SETTINGS = {
  click: { frequency: 420, duration: 0.12, volume: 0.2 },
  focus: { frequency: 620, duration: 0.16, volume: 0.16 },
  valid: { frequency: 920, duration: 0.13, volume: 0.18 },
  success: { frequency: 520, duration: 0.62, volume: 0.22 },
} satisfies Record<SoundKind, { frequency: number; duration: number; volume: number }>;

function createToneAudio(kind: SoundKind) {
  const { frequency, duration } = SOUND_SETTINGS[kind];
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
    const envelope = Math.min(1, time / 0.012) * Math.min(1, (duration - time) / 0.08);
    const frequencyAtTime = kind === "success" ? frequency + 260 * (time / duration) : frequency;
    view.setInt16(44 + index * 2, Math.sin(time * frequencyAtTime * Math.PI * 2) * envelope * 0.78 * 32767, true);
  }
  const audio = new Audio(URL.createObjectURL(new Blob([buffer], { type: "audio/wav" })));
  audio.preload = "auto";
  audio.volume = SOUND_SETTINGS[kind].volume;
  audio.load();
  return audio;
}

function primeFeedbackSounds(audioRef: MutableRefObject<Partial<Record<SoundKind, HTMLAudioElement>>>) {
  if (!SOUND_ENABLED || typeof window === "undefined") return;
  (Object.keys(SOUND_SETTINGS) as SoundKind[]).forEach((kind) => {
    if (!audioRef.current[kind]) audioRef.current[kind] = createToneAudio(kind);
  });
}

function playFeedbackSound(kind: SoundKind, audioRef: MutableRefObject<Partial<Record<SoundKind, HTMLAudioElement>>>) {
  if (!SOUND_ENABLED || typeof window === "undefined") return;
  try {
    primeFeedbackSounds(audioRef);
    const audio = audioRef.current[kind];
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
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
  const audioRef = useRef<Partial<Record<SoundKind, HTMLAudioElement>>>({});
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
        playFeedbackSound("success", audioRef);
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
          <button className={`clonao-waitlist-card__entry-button${isPressed ? " is-pressed" : ""}`} type="button" onClick={() => pressAndRun(() => { playFeedbackSound("click", audioRef); setStep("email"); })}>Join early access</button>
        </> : null}

        {step === "email" ? <>
          <h2>Enter your email</h2>
          <form className="clonao-waitlist-card__form" onSubmit={submit} noValidate>
            <label className="sr-only" htmlFor="waitlist-email">Email address</label>
            <span className={`clonao-waitlist-card__input-wrap${emailFocused ? " is-focused" : ""}${emailValid ? " is-valid" : ""}`}>
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 6.5h16v11H4z" /><path d="m4.5 7 7.5 6 7.5-6" /></svg>
              <input ref={emailRef} id="waitlist-email" name="email" type="email" placeholder="Email address" autoComplete="email" required value={email} onFocus={() => { setEmailFocused(true); if (!focusSoundPlayedRef.current) { focusSoundPlayedRef.current = true; playFeedbackSound("focus", audioRef); } }} onBlur={() => setEmailFocused(false)} onChange={(event) => { const nextEmail = event.target.value; const nextIsValid = event.currentTarget.checkValidity(); setEmail(nextEmail); setEmailValid(nextIsValid); setStatus("idle"); setErrorMessage(""); if (nextIsValid && !validSoundPlayedRef.current) { validSoundPlayedRef.current = true; playFeedbackSound("valid", audioRef); } if (!nextIsValid) validSoundPlayedRef.current = false; }} />
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
