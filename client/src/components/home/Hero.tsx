import Logo from "@/src/components/layout/Logo";

type HeroProps = {
  title: string;
  tagline: string;
};

export default function Hero({ title, tagline }: HeroProps) {
  return (
    <section
      className="relative flex min-h-screen overflow-hidden bg-bg-secondary ps-6 pe-6 text-fg-secondary"
      data-section="hero"
    >
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[var(--max-content)] flex-col items-center justify-center gap-5 text-center">
        <div className="mb-3 sm:mb-5">
          <Logo width={200} />
        </div>
        <h1 className="max-w-4xl text-h2 leading-display text-fg-secondary sm:text-h1 lg:text-display">
          {title}
        </h1>
        <p className="max-w-xl text-body-lg leading-body text-fg-muted">
          {tagline}
        </p>
      </div>
    </section>
  );
}
