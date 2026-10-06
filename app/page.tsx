import ClonaoFooter from "../components/clonao-footer";
import ClonaoWaitlistCard from "../components/clonao-waitlist-card";

export default function Home() {
  return (
    <>
      <main className="hero-atmosphere">
      <nav className="navbar" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Clonao home">
          <img className="brand-mark" src="/clonao-logo.png" alt="" aria-hidden="true" />
          <span>Clonao</span>
        </a>
        <div className="nav-links" id="primary-menu">
          {["Product", "How it works", "Pricing", "Resources"].map((item) => <a href={`#${item.toLowerCase().replaceAll(" ", "-")}`} key={item}>{item}</a>)}
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy reveal">
          <h1>The #1 Personal Brand AI for LinkedIn.</h1>
            <p>Clonao finds the gaps in your brand and tells you what to focus on next.</p>
        </div>

        <ClonaoWaitlistCard />

      </section>
      </main>
      <ClonaoFooter />
    </>
  );
}
