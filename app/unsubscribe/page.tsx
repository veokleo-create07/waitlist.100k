export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const success = status === "success";

  return (
    <main className="unsubscribe-page">
      <div className="unsubscribe-content">
        <a href="/" className="unsubscribe-brand" aria-label="Clonao home"><img src="/clonao-logo.png" alt="" /> <span>Clonao</span></a>
        <h1>{success ? "You’re unsubscribed." : "We couldn’t process that request."}</h1>
        <p>{success ? "You will no longer receive Clonao waitlist, early-access, launch, or product-update emails." : "Please use the unsubscribe link from the original Clonao email or contact team@clonao.com."}</p>
        <a className="unsubscribe-home" href="/">Back to Clonao</a>
      </div>
    </main>
  );
}
