export default function ClonaoFooter() {
  return <>
    <section className="footer-cta" aria-labelledby="footer-cta-title">
      <div className="footer-cta__inner">
        <h2 id="footer-cta-title">Turn your knowledge into the brand you should be known for.</h2>
        <p>Try Clonao today and get your personal brand diagnosis.</p>
        <a href="#top" className="footer-cta__button">Get Early Access</a>
      </div>
    </section>
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand"><a href="#top" className="site-footer__logo" aria-label="Clonao home"><img src="/clonao-logo.png" alt="" /> <span>Clonao</span></a><p>Personal brand intelligence for people with<br className="footer-break" /> something worth saying.</p></div>
          <div className="site-footer__links">
            <div><p className="site-footer__label">Legal</p><a href="/privacy">Privacy Policy</a></div>
          </div>
        </div>
        <div className="site-footer__bottom"><span>© 2026 Clonao</span></div>
      </div>
    </footer>
  </>;
}
