"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "error" | "joining" | "success">("idle");
  const [email, setEmail] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailRef.current?.checkValidity()) { setStatus("error"); emailRef.current?.focus(); return; }
    setStatus("joining");
    window.setTimeout(() => setStatus("success"), 650);
  }

  return (
    <main className="hero-atmosphere">
      <nav className="navbar" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Clonao home">
          <img className="brand-mark" src="/clonao-logo.png" alt="" aria-hidden="true" />
          <span>Clonao</span>
        </a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}>
          <span /><span />
        </button>
        <div className={`nav-links${menuOpen ? " is-open" : ""}`} id="primary-menu">
          {["Product", "How it works", "Pricing", "Resources"].map((item) => <a href={`#${item.toLowerCase().replaceAll(" ", "-")}`} key={item} onClick={() => setMenuOpen(false)}>{item}</a>)}
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy reveal">
          <h1>The #1 Personal Brand AI for LinkedIn.</h1>
          <p>Clonao analyzes your personal brand, identifies the gaps, builds the strategy and tells you exactly what to focus on next.</p>
        </div>

        <section className="waitlist reveal" aria-live="polite">
          <div className="sheen" aria-hidden="true" />
          {status === "success" ? <><h2>You’re on the list.</h2><p className="success-message">We’ll let you know when Clonao is ready.</p></> : <>
            <h2>Get early access</h2>
            <p>Be the first to try Clonao when we launch.</p>
            <form className="waitlist-form" onSubmit={submit} noValidate>
              <label className="sr-only" htmlFor="email">Email address</label>
              <input ref={emailRef} id="email" name="email" type="email" placeholder="Email address" autoComplete="email" required value={email} onChange={(event) => { setEmail(event.target.value); setStatus("idle"); }} />
              <button type="submit" disabled={status === "joining"}>{status === "joining" ? "Joining…" : "Join the waitlist"}</button>
            </form>
            <p className={`form-status${status === "error" ? " error" : ""}`} role="status">{status === "error" ? "Please enter a valid email address." : ""}</p>
          </>}
        </section>

        <div className="demo-wrap reveal" id="product">
          <div className="window-lights" aria-hidden="true"><i /><i /><i /></div>
          <img src="/clonao-demo.png" alt="Clonao dashboard showing next best moves, strategy, analytics, and Brand Graph" />
        </div>
      </section>
    </main>
  );
}
