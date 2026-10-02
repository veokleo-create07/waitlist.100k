export default function ClonaoFooter() {
  return <>
    <section className="footer-cta" aria-labelledby="footer-cta-title">
      <div className="footer-cta__inner">
        <h2 id="footer-cta-title">Turn your knowledge into the brand you should be known for.</h2>
        <p>Try Clonao today and get your personal brand diagnosis.</p>
        <a href="#top" className="footer-cta__button">Start for free</a>
      </div>
    </section>
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand"><a href="#top" className="site-footer__logo" aria-label="Clonao home"><img src="/clonao-logo.png" alt="" /> <span>Clonao</span></a><p>Personal brand intelligence for people with<br className="footer-break" /> something worth saying.</p></div>
          <div className="site-footer__links">
            <div><p className="site-footer__label">Product</p><a href="#product">Product</a><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a></div>
            <div><p className="site-footer__label">Resources</p><a href="#resources">Resources</a><a href="mailto:team@clonao.com">Contact</a></div>
            <div><p className="site-footer__label">Legal</p><a href="/privacy">Privacy</a><a href="#terms">Terms</a></div>
          </div>
        </div>
        <div className="site-footer__bottom"><span>© 2026 Clonao</span><div className="site-footer__socials" aria-label="Social links"><a href="#instagram" aria-label="Instagram">◎</a><a href="#linkedin" aria-label="LinkedIn">in</a><a href="#x" aria-label="X">𝕏</a></div></div>
      </div>
    </footer>
  </>;
}
