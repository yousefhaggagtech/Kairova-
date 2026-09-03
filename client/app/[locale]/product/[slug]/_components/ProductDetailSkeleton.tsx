function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-surface-dark ${className}`}
    />
  );
}

export default function ProductDetailSkeleton() {
  return (
    <div className="bg-bg-absolute text-fg-primary">
      <section className="mx-auto grid w-full max-w-[var(--max-content)] gap-10 px-4 py-10 md:px-10 md:py-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.72fr)] lg:items-start lg:gap-16 lg:py-20">
        <div className="-mx-4 flex max-w-[100vw] snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:max-w-none md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 md:gap-6 lg:gap-8 [&::-webkit-scrollbar]:hidden">
          <SkeletonBlock className="aspect-[4/5] w-[min(86vw,24rem)] max-w-full shrink-0 snap-center md:col-span-2 md:w-auto md:shrink lg:aspect-[6/7] lg:min-h-[72svh]" />
          <SkeletonBlock className="aspect-[4/5] w-[min(86vw,24rem)] max-w-full shrink-0 snap-center md:w-auto md:shrink" />
          <SkeletonBlock className="aspect-[4/5] w-[min(86vw,24rem)] max-w-full shrink-0 snap-center md:w-auto md:shrink" />
          <SkeletonBlock className="aspect-[16/11] w-[min(86vw,24rem)] max-w-full shrink-0 snap-center md:col-span-2 md:w-auto md:shrink" />
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border-t border-border-subtle pt-8 lg:border-t-0 lg:pt-0">
            <SkeletonBlock className="mb-5 h-4 w-28" />
            <SkeletonBlock className="h-14 w-4/5 sm:h-20" />
            <SkeletonBlock className="mt-5 h-7 w-36" />
            <SkeletonBlock className="mt-8 h-44 w-full" />
            <SkeletonBlock className="mt-7 h-14 w-full" />
            <div className="mt-10 space-y-4 border-t border-border-subtle pt-7">
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-4 w-40" />
              <SkeletonBlock className="h-4 w-32" />
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto w-full max-w-[var(--max-content)] border-t border-border-subtle px-4 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-5 h-12 w-2/3" />
            <SkeletonBlock className="mt-8 h-px w-20" />
            <div className="mt-8 space-y-3">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-11/12" />
              <SkeletonBlock className="h-4 w-5/6" />
            </div>
          </div>
          <div>
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-5 h-12 w-2/3" />
            <div className="mt-8 space-y-5">
              <SkeletonBlock className="h-6 w-full" />
              <SkeletonBlock className="h-6 w-full" />
              <SkeletonBlock className="h-6 w-full" />
              <SkeletonBlock className="h-6 w-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[var(--max-content)] border-t border-border-subtle px-4 py-16 md:px-10 md:py-24">
        <SkeletonBlock className="h-4 w-40" />
        <SkeletonBlock className="mt-5 h-12 w-72 max-w-full" />
        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
          <SkeletonBlock className="aspect-[4/5]" />
          <SkeletonBlock className="aspect-[4/5]" />
          <SkeletonBlock className="aspect-[4/5]" />
          <SkeletonBlock className="aspect-[4/5]" />
        </div>
      </section>
    </div>
  );
}
