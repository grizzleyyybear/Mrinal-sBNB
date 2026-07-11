"use client";

import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { ExploreGrid } from "@/components/explore-grid";
import { TopNav } from "@/components/top-nav";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUsers, useWishlist, useWishlistToggle } from "@/hooks/use-listings";

export default function WishlistsPage() {
  const usersQuery = useUsers();
  const { currentUser, currentUserId, selectUser } = useCurrentUser(usersQuery.data);
  const wishlistQuery = useWishlist(currentUserId);
  const wishlistToggle = useWishlistToggle(currentUserId);
  const listings = wishlistQuery.data?.items ?? [];

  return (
    <main className="min-h-screen bg-white">
      <TopNav users={usersQuery.data} currentUser={currentUser} onUserChange={selectUser} />

      <section className="airbnb-page airbnb-page--wide py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-ink">Wishlists</h1>
            <p className="mt-1 text-sm text-muted">
              {currentUser ? `Saved stays for ${currentUser.name}` : "Your saved stays"}
            </p>
          </div>
          <Link href="/" className="inline-flex h-11 items-center rounded-lg border border-ink px-5 text-sm font-medium text-ink">
            Explore more stays
          </Link>
        </div>

        {wishlistQuery.isLoading ? (
          <div className="grid min-h-[360px] place-items-center">
            <Loader2 className="animate-spin text-rausch" size={32} />
          </div>
        ) : null}

        {wishlistQuery.isError ? (
          <div className="grid min-h-[360px] place-items-center rounded-air border border-hairline p-8 text-center">
            <p className="max-w-md text-sm text-muted">Wishlists could not be loaded. Check that the backend is running.</p>
          </div>
        ) : null}

        {!wishlistQuery.isLoading && !wishlistQuery.isError && !listings.length ? (
          <div className="grid min-h-[360px] place-items-center rounded-air border border-hairline p-8 text-center">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-soft text-rausch">
                <Heart size={22} />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-ink">No saved stays yet</h2>
              <p className="mt-2 max-w-md text-sm text-muted">Tap the heart on any stay to save it here.</p>
              <Link href="/" className="mt-5 inline-flex h-12 items-center rounded-lg bg-rausch px-6 text-sm font-medium text-white">
                Browse stays
              </Link>
            </div>
          </div>
        ) : null}

        {listings.length ? (
          <ExploreGrid
            listings={listings}
            isLoading={false}
            isError={false}
            togglingListingId={wishlistToggle.isPending ? wishlistToggle.variables : undefined}
            onToggleWishlist={(listingId) => wishlistToggle.mutate(listingId)}
          />
        ) : null}
      </section>
    </main>
  );
}
