import Link from "next/link";

export function Footer() {
  const columns = [
    { heading: "Support", links: [["Help Centre", "help-centre"], ["AirCover", "aircover"], ["Anti-discrimination", "anti-discrimination"], ["Cancellation options", "cancellation-options"]] },
    { heading: "Hosting", links: [["Airbnb your home", "airbnb-your-home"], ["AirCover for Hosts", "aircover-hosts"], ["Hosting resources", "hosting-resources"], ["Community forum", "community-forum"]] },
    { heading: "Airbnb", links: [["Newsroom", "newsroom"], ["New features", "new-features"], ["Careers", "careers"], ["Investors", "investors"]] }
  ];

  return (
    <footer className="mt-12 border-t border-hairline bg-surface-soft">
      <div className="airbnb-page airbnb-page--wide py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <section key={column.heading}>
              <h2 className="mb-3 text-sm font-semibold text-ink">{column.heading}</h2>
              <ul className="space-y-2">
                {column.links.map(([label, slug]) => <li key={slug}><Link href={`/info/${slug}`} className="text-sm text-muted transition hover:text-ink hover:underline">{label}</Link></li>)}
              </ul>
            </section>
          ))}
        </div>
        <section className="mt-10 border-t border-hairline pt-7">
          <p className="text-sm font-semibold text-ink">Meet the dev</p>
          <a href="https://mrinal.social" target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm text-muted transition hover:text-ink hover:underline">Mrinal Sharma · mrinal.social</a>
        </section>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-6 text-sm text-muted"><span>© 2026 Airbnb Clone · <Link href="/info/privacy" className="hover:underline">Privacy</Link> · <Link href="/info/terms" className="hover:underline">Terms</Link> · <Link href="/info/sitemap" className="hover:underline">Sitemap</Link></span><a href="https://mrinal.social" target="_blank" rel="noreferrer" className="transition hover:text-ink hover:underline">A project by Mrinal Sharma</a></div>
      </div>
    </footer>
  );
}
