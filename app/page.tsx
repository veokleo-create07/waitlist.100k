"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ClonaoFooter from "../components/clonao-footer";
import ClonaoGlassInteraction from "../components/clonao-glass-interaction";
import ClonaoWaitlistCard from "../components/clonao-waitlist-card";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <>
      <main className="hero-atmosphere">
        <div className="hero-scene-layer" aria-hidden="true">
          <Image
            src="https://i.postimg.cc/N04PPG0C/Glass-Capsule-Among-the-Clouds.png"
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="hero-scene-image"
          />
        </div>
        <ClonaoGlassInteraction />
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

          <ClonaoWaitlistCard />

        </section>
      </main>
      <ClonaoFooter />
    </>
  );
}
