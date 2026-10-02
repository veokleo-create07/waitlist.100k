"use client";

import { useEffect, useState } from "react";

const navigation = [
  ["collect", "What We Collect"],
  ["use", "How We Use Your Information"],
  ["emails", "Emails"],
  ["storage", "How We Store Your Information"],
  ["retention", "How Long We Keep Your Information"],
  ["choices", "Your Choices"],
  ["security", "Security"],
  ["cookies", "Cookies"],
  ["scope", "Current Scope"],
  ["changes", "Changes to This Policy"],
  ["contact", "Contact"],
] as const;

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState("collect");

  useEffect(() => {
    const headings = navigation.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]?.target.id) setActiveSection(visible[0].target.id);
    }, { rootMargin: "-12% 0px -72% 0px", threshold: [0, 1] });
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="privacy-page">
      <header className="privacy-nav">
        <a href="/" className="privacy-brand" aria-label="Clonao home"><img src="/clonao-logo.png" alt="" /> <span>Clonao</span></a>
        <a className="privacy-home-link" href="/">Back to Clonao</a>
      </header>

      <div className="privacy-layout">
        <article className="privacy-article">
          <header className="privacy-header">
            <h1>Privacy Policy</h1>
            <p>Last updated: October 2, 2026</p>
          </header>

          <div className="privacy-prose">
            <p><strong>Your privacy matters to us.</strong></p>
            <p>This Privacy Policy explains how Clonao collects, uses, stores, and protects information when you visit clonao.com or join our waitlist.</p>
            <p>We do not sell your personal information.</p>
            <p>For any questions or concerns, contact us at <a href="mailto:team@clonao.com">team@clonao.com</a>.</p>

            <section><h2 id="collect">What We Collect</h2><p>When you join the Clonao waitlist, we collect:</p><ul><li>your email address</li><li>the date you joined</li><li>your waitlist or subscription status</li><li>the source through which you joined, where available</li></ul><p>Our website and infrastructure providers may also process limited technical information needed to operate and secure the site, such as IP address, browser information, device information, timestamps, and basic server logs.</p><p>We do not currently collect payment details, LinkedIn credentials, uploaded documents, or other full-product data through the waitlist.</p></section>

            <section><h2 id="use">How We Use Your Information</h2><p>We use your information to:</p><ul><li>add you to the Clonao waitlist</li><li>confirm your signup</li><li>notify you about early access</li><li>send launch announcements</li><li>send closely related Clonao product updates</li><li>operate and secure the website</li><li>respond to support or privacy requests</li></ul><p>We do not use your waitlist email for unrelated advertising.</p></section>

            <section><h2 id="emails">Emails</h2><p>By joining the waitlist, you may receive:</p><ul><li>waitlist confirmation emails</li><li>early-access invitations</li><li>launch updates</li><li>closely related Clonao product updates</li></ul><p>You can unsubscribe at any time using the unsubscribe option included in our emails.</p><p>Once your unsubscribe request is processed, we will stop sending you non-essential emails.</p><p>You can also contact <a href="mailto:team@clonao.com">team@clonao.com</a> at any time.</p></section>

            <section><h2 id="storage">How We Store Your Information</h2><p>We currently use third-party services to operate the waitlist.</p><h3>Supabase</h3><p>We use Supabase to store waitlist information, including your email address and subscription status.</p><h3>Resend</h3><p>We use Resend to send waitlist confirmations, early-access emails, launch announcements, and related product updates.</p><p>We may also use hosting and infrastructure providers required to operate clonao.com.</p><p>Some of these providers may process data outside Albania. Where required, appropriate data-protection safeguards are used.</p></section>

            <section><h2 id="retention">How Long We Keep Your Information</h2><p>We keep your waitlist information while you remain subscribed and for up to 12 months after Clonao’s public launch, unless you ask us to delete it earlier.</p><p>If you unsubscribe, we may keep a limited record of your email address and unsubscribe status so we do not accidentally contact you again.</p><p>Information that is no longer needed may be deleted or anonymized.</p></section>

            <section><h2 id="choices">Your Choices</h2><p>You may contact us to:</p><ul><li>access information we hold about you</li><li>correct inaccurate information</li><li>request deletion of your information</li><li>withdraw your consent</li><li>unsubscribe from Clonao emails</li><li>raise a concern about how your information is handled</li></ul><p>Contact us at:</p><p><a href="mailto:team@clonao.com">team@clonao.com</a></p></section>

            <section><h2 id="security">Security</h2><p>We use reasonable technical and organizational measures designed to protect your information from unauthorized access, loss, misuse, alteration, or disclosure.</p><p>No online system can guarantee absolute security.</p></section>

            <section><h2 id="cookies">Cookies</h2><p>Clonao does not currently use advertising cookies on the waitlist website.</p><p>The website may use technologies required for basic functionality, security, and website delivery.</p><p>If we introduce additional analytics or tracking technologies in the future, this Privacy Policy will be updated where necessary.</p></section>

            <section><h2 id="scope">Current Scope</h2><p>This Privacy Policy covers the current Clonao waitlist website and related launch communications.</p><p>Before Clonao launches functionality such as user accounts, LinkedIn integrations, uploads, AI processing, payments, or additional analytics, this policy will be updated to reflect those features.</p></section>

            <section><h2 id="changes">Changes to This Policy</h2><p>We may update this Privacy Policy as Clonao develops.</p><p>When we make changes, we will update the date at the top of this page.</p></section>

            <section><h2 id="contact">Contact</h2><p>If you have any questions, concerns, or requests regarding your information or this Privacy Policy, contact:</p><p>Clonao<br /><a href="mailto:team@clonao.com">team@clonao.com</a></p></section>
          </div>
        </article>

        <aside className="privacy-sidebar" aria-label="On this page"><p>On this page</p><nav>{navigation.map(([id, label]) => <a key={id} href={`#${id}`} className={activeSection === id ? "is-active" : ""} aria-current={activeSection === id ? "location" : undefined}>{label}</a>)}</nav></aside>
      </div>

      <footer className="privacy-footer"><span>© 2026 Clonao</span><a href="/privacy">Privacy Policy</a><a href="mailto:team@clonao.com">team@clonao.com</a></footer>
    </main>
  );
}
