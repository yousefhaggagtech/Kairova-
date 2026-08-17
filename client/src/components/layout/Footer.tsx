import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const site = await getTranslations("site");
  const footer = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-light bg-bg-secondary text-fg-muted">
      <div className="mx-auto flex max-w-[var(--max-content)] items-center justify-center ps-6 pe-6 pt-8 pb-8 text-center text-caption md:ps-10 md:pe-10">
        <p>
          &copy; {year} {site("title")}. {footer("rights")}.
        </p>
      </div>
    </footer>
  );
}
