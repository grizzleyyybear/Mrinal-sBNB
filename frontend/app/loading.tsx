export default function Loading() {
  return (
    <main className="min-h-screen bg-white" aria-label="Loading">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-10">
        <div className="h-8 w-28 animate-pulse rounded bg-surface-strong" />
        <div className="hidden h-12 w-[360px] animate-pulse rounded-full bg-surface-strong sm:block" />
        <div className="h-10 w-24 animate-pulse rounded-full bg-surface-strong" />
      </div>
      <div className="airbnb-page airbnb-page--detail py-8">
        <div className="h-8 w-80 animate-pulse rounded bg-surface-strong" />
        <div className="mt-3 h-4 w-48 animate-pulse rounded bg-surface-strong" />
        <div className="mt-8 grid gap-3 md:h-[440px] md:grid-cols-4 md:grid-rows-2">
          <div className="h-[310px] animate-pulse rounded-xl bg-surface-strong md:col-span-2 md:row-span-2 md:h-auto" />
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="hidden animate-pulse bg-surface-strong md:block" />)}
        </div>
      </div>
    </main>
  );
}
