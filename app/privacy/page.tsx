"use client";

import { useEffect, useState } from "react";

const navigation = [
  ["scope", "Scope and Applicability"],
  ["collect", "What Information Do We Collect?"],
  ["use", "How Do We Use the Information We Collect?"],
  ["email", "Email Communications"],
  ["legal-basis", "Legal Basis for Processing"],
  ["storage", "How We Store Your Information"],
  ["sell", "Do We Sell Your Personal Information?"],
  ["share", "When May We Share Information?"],
  ["international", "International Data Processing"],
  ["retention", "Data Retention"],
  ["security", "How Do We Protect Your Information?"],
  ["cookies", "Cookies and Tracking Technologies"],
  ["rights", "Your Privacy Rights"],
  ["children", "Children's Privacy"],
  ["changes", "Changes to This Privacy Policy"],
  ["contact", "Contact Us"],
] as const;

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState("scope");

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
            <p>Last updated on October 2, 2026</p>
          </header>

          <div className="privacy-prose">
            <p><strong>Your privacy matters to us.</strong></p>
            <p>This Privacy Policy explains how <strong>Clonao</strong> (“Clonao,” “we,” “us,” or “our”) collects, uses, stores, and protects information when you visit <strong>clonao.com</strong>, join our waitlist, or otherwise interact with our website.</p>
            <p>At this stage, Clonao is operating as an early-access software product. The website is primarily used to provide information about Clonao and allow interested users to join the waitlist.</p>
            <p>We do not sell your personal information.</p>
            <p>For questions regarding this Privacy Policy or your data, you can contact us at <strong>team@clonao.com</strong>.</p>

            <section><h2 id="scope">Scope and Applicability</h2><p>This Privacy Policy applies to information collected through:</p><ul><li>clonao.com</li><li>the Clonao waitlist</li><li>emails sent by Clonao</li><li>other pages that link to this Privacy Policy</li></ul><p>The full Clonao software product is still under development. When additional product features become available, this Privacy Policy may be updated to reflect additional types of information and processing.</p></section>

            <section><h2 id="collect">What Information Do We Collect?</h2><h3>Information you provide</h3><p>When you join the Clonao waitlist, we currently collect:</p><ul><li>your email address</li><li>the date and time you joined</li><li>your subscription or waitlist status</li><li>the source through which you joined, where applicable</li></ul><p>We currently do not require you to provide your name, payment details, LinkedIn credentials, documents, personal-brand data, or other account information simply to join the waitlist.</p><h3>Automatically collected information</h3><p>When you access the website, our hosting and infrastructure providers may automatically process limited technical information necessary to operate and secure the site, such as:</p><ul><li>IP address</li><li>browser type</li><li>device information</li><li>request information</li><li>timestamps</li><li>basic server logs</li></ul><p>We may introduce privacy-conscious analytics in the future to better understand how visitors use the website.</p></section>

            <section><h2 id="use">How Do We Use the Information We Collect?</h2><p>We use your information to:</p><ul><li>add you to the Clonao waitlist</li><li>confirm your waitlist registration</li><li>notify you when early access becomes available</li><li>send Clonao launch announcements</li><li>send relevant product updates</li><li>share important development or availability information</li><li>maintain and secure the website</li><li>prevent abuse or fraudulent activity</li><li>respond to privacy or support requests</li></ul><p>We do not use your waitlist email for unrelated third-party advertising.</p></section>

            <section><h2 id="email">Email Communications</h2><p>When you join the waitlist, you may receive emails relating to Clonao, including:</p><ul><li>waitlist confirmation</li><li>early-access invitations</li><li>launch announcements</li><li>product updates</li><li>important Clonao news</li></ul><p>You can unsubscribe from these communications at any time by using the unsubscribe link provided in an email.</p><p>You may also contact:</p><p><strong>team@clonao.com</strong></p><p>Once you unsubscribe, we will stop sending you non-essential marketing or product-update emails.</p></section>

            <section><h2 id="legal-basis">Legal Basis for Processing</h2><p><strong>Consent</strong><br />When you voluntarily join the Clonao waitlist and agree to receive launch and product communications.</p><p><strong>Legitimate interests</strong><br />Where processing is reasonably necessary to operate, secure, improve, and protect the website.</p><p><strong>Legal obligations</strong><br />Where processing is required to comply with applicable laws or lawful requests.</p><p>You may withdraw consent at any time where processing is based on consent.</p></section>

            <section><h2 id="storage">How We Store Your Information</h2><p>Clonao currently uses third-party infrastructure providers to operate the website and waitlist.</p><h3>Supabase</h3><p>We use Supabase to store waitlist information, including email addresses and subscription status.</p><h3>Resend</h3><p>We use Resend to send waitlist confirmations, early-access emails, launch announcements, and other Clonao communications.</p><h3>Hosting and infrastructure</h3><p>We may use cloud hosting, content-delivery, security, and infrastructure providers required to operate clonao.com.</p><p>These providers may process information on our behalf only as necessary to provide their services.</p></section>

            <section><h2 id="sell">Do We Sell Your Personal Information?</h2><p><strong>No.</strong></p><p>Clonao does not sell personal information to advertisers, data brokers, or other third parties.</p><p>We do not provide your waitlist email address to other companies for their own independent advertising purposes.</p></section>

            <section><h2 id="share">When May We Share Information?</h2><p>We may share limited personal information with service providers that help us operate Clonao, including providers of:</p><ul><li>database infrastructure</li><li>website hosting</li><li>email delivery</li><li>security</li><li>analytics, if introduced</li><li>technical infrastructure</li></ul><p>We may also disclose information where required by law, court order, regulatory requirement, or another valid legal process.</p></section>

            <section><h2 id="international">International Data Processing</h2><p>Some of the technology providers used by Clonao may operate infrastructure outside Albania.</p><p>As a result, information may be processed in other jurisdictions.</p><p>Where required, Clonao will use appropriate safeguards for international transfers of personal data.</p></section>

            <section><h2 id="retention">Data Retention</h2><p>We retain waitlist information for as long as reasonably necessary to:</p><ul><li>maintain the waitlist</li><li>provide early access</li><li>communicate relevant Clonao updates</li><li>comply with legal obligations</li><li>maintain unsubscribe records</li></ul><p>If you unsubscribe, we may retain a limited record of your email and unsubscribe status so that we do not accidentally subscribe you again.</p><p>Information that is no longer required may be deleted or anonymized.</p></section>

            <section><h2 id="security">How Do We Protect Your Information?</h2><p>We use reasonable technical and organizational measures intended to protect information against:</p><ul><li>unauthorized access</li><li>disclosure</li><li>alteration</li><li>loss</li><li>misuse</li><li>destruction</li></ul><p>However, no online system or electronic storage method can guarantee absolute security.</p></section>

            <section><h2 id="cookies">Cookies and Tracking Technologies</h2><p>Clonao does not currently use advertising cookies on the waitlist website.</p><p>The site may use technologies that are strictly necessary for:</p><ul><li>website operation</li><li>security</li><li>network delivery</li><li>basic functionality</li></ul><p>If we later introduce analytics, advertising technologies, or other non-essential cookies, we will update this Privacy Policy and implement additional controls where required.</p></section>

            <section><h2 id="rights">Your Privacy Rights</h2><p>Depending on applicable law, you may have rights relating to your personal information, including the right to:</p><ul><li>request access to your information</li><li>request correction of inaccurate information</li><li>request deletion</li><li>request restriction of processing</li><li>object to certain processing</li><li>withdraw consent</li><li>request portability where applicable</li><li>lodge a complaint with the relevant data-protection authority</li></ul><p>To exercise a privacy right, contact:</p><p><strong>team@clonao.com</strong></p><p>We may need to verify your request before taking action.</p></section>

            <section><h2 id="children">Children&apos;s Privacy</h2><p>Clonao is not currently designed for children.</p><p>We do not knowingly collect personal information from children through the waitlist.</p><p>If you believe that a child has submitted personal information to Clonao, contact us at <strong>team@clonao.com</strong>.</p></section>

            <section><h2 id="changes">Changes to This Privacy Policy</h2><p>Clonao is still being developed.</p><p>As the product grows, we may update this Privacy Policy to reflect:</p><ul><li>new product functionality</li><li>accounts and authentication</li><li>LinkedIn integrations</li><li>user uploads</li><li>Brand Graph data</li><li>AI processing</li><li>payments</li><li>analytics</li><li>additional service providers</li></ul><p>When changes are made, we will update the date shown at the top of this page.</p><p>Material changes may also be communicated through the website or email where appropriate.</p></section>

            <section><h2 id="contact">Contact Us</h2><p>For questions, requests, or concerns relating to privacy or your personal information:</p><p><strong>Clonao</strong><br />Albania<br /><strong>team@clonao.com</strong></p></section>
          </div>
        </article>

        <aside className="privacy-sidebar" aria-label="On this page"><p>On this page</p><nav>{navigation.map(([id, label]) => <a key={id} href={`#${id}`} className={activeSection === id ? "is-active" : ""} aria-current={activeSection === id ? "location" : undefined}>{label}</a>)}</nav></aside>
      </div>

      <footer className="privacy-footer"><span>© 2026 Clonao</span><a href="/privacy">Privacy Policy</a><a href="mailto:team@clonao.com">team@clonao.com</a></footer>
    </main>
  );
}
