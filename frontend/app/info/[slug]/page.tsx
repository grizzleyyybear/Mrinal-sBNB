"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, Compass, ShieldCheck } from "lucide-react";
import { TopNav } from "@/components/top-nav";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUsers } from "@/hooks/use-listings";

const pages: Record<string, { eyebrow: string; title: string; body: string; icon: "shield" | "briefcase" | "compass" }> = {
  "help-centre": { eyebrow: "Support", title: "Help Centre", body: "Find clear guidance for searching, saving stays, managing a reservation, and contacting your host.", icon: "compass" },
  aircover: { eyebrow: "Support", title: "AirCover", body: "Learn how support is structured around booking confidence and issues that can arise before or during a stay.", icon: "shield" },
  "anti-discrimination": { eyebrow: "Support", title: "Anti-discrimination", body: "Everyone should be able to use the platform with respect, fairness, and confidence.", icon: "shield" },
  "cancellation-options": { eyebrow: "Support", title: "Cancellation options", body: "Review the cancellation terms shown before reservation confirmation and keep trip plans clear.", icon: "compass" },
  "airbnb-your-home": { eyebrow: "Hosting", title: "Airbnb your home", body: "Create and manage a listing, keep availability accurate, and welcome guests with complete stay details.", icon: "briefcase" },
  "aircover-hosts": { eyebrow: "Hosting", title: "AirCover for Hosts", body: "A practical overview of the support concepts available to listing hosts.", icon: "shield" },
  "hosting-resources": { eyebrow: "Hosting", title: "Hosting resources", body: "Use practical listing guidance to write clear descriptions, select amenities, and maintain calendar accuracy.", icon: "briefcase" },
  "community-forum": { eyebrow: "Hosting", title: "Community forum", body: "A place for hosts to exchange ideas about welcoming guests and improving stays.", icon: "compass" },
  newsroom: { eyebrow: "Airbnb", title: "Newsroom", body: "Product and community updates for this stay-booking experience.", icon: "compass" },
  "new-features": { eyebrow: "Airbnb", title: "New features", body: "Explore the latest improvements to discovery, reservations, wishlists, and host management.", icon: "compass" },
  careers: { eyebrow: "Careers", title: "Build thoughtful travel tools", body: "We are looking for curious people who care about clear interfaces, reliable booking flows, and guest-first details. This assignment experience was crafted by Mrinal Sharma.", icon: "briefcase" },
  investors: { eyebrow: "Airbnb", title: "Investors", body: "A concise overview of product thinking, operational focus, and sustainable marketplace growth.", icon: "briefcase" },
  privacy: { eyebrow: "Legal", title: "Privacy", body: "This assignment stores the selected profile and checkout draft locally in the browser, while reservation and listing records are managed by the local API.", icon: "shield" },
  terms: { eyebrow: "Legal", title: "Terms", body: "This is an educational stay-booking project. Confirmed reservations use the local backend availability rules.", icon: "shield" },
  sitemap: { eyebrow: "Explore", title: "Sitemap", body: "Browse stays, saved homes, trips, host tools, support, and the full set of informational pages from the footer.", icon: "compass" }
};

export default function InfoPage() {
  const params = useParams<{ slug: string }>();
  const page = pages[params.slug] ?? { eyebrow: "Information", title: "Page not found", body: "This link is no longer available.", icon: "compass" as const };
  const usersQuery = useUsers();
  const { currentUser, selectUser } = useCurrentUser(usersQuery.data);
  const Icon = page.icon === "shield" ? ShieldCheck : page.icon === "briefcase" ? BriefcaseBusiness : Compass;

  return (
    <main className="min-h-screen bg-white">
      <TopNav users={usersQuery.data} currentUser={currentUser} onUserChange={selectUser} />
      <section className="airbnb-page airbnb-page--detail py-12 sm:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition hover:underline"><ArrowLeft size={16} /> Explore stays</Link>
        <div className="mt-10 max-w-2xl">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-soft text-rausch"><Icon size={23} /></span>
          <p className="mt-7 text-sm font-semibold text-muted">{page.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-ink sm:text-4xl">{page.title}</h1>
          <p className="mt-5 text-lg leading-8 text-body">{page.body}</p>
          {params.slug === "careers" ? <a href="https://mrinal.social" target="_blank" rel="noreferrer" className="mt-8 inline-flex h-12 items-center rounded-lg border border-ink px-5 text-sm font-semibold text-ink transition hover:bg-surface-soft">More about Mrinal Sharma</a> : null}
        </div>
      </section>
    </main>
  );
}
