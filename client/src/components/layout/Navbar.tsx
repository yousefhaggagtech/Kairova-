import { getTranslations } from "next-intl/server";

import { Link } from "@/src/i18n/navigation";

import CartLink from "./CartLink";
import LocaleSwitcher from "./LocaleSwitcher";
import Logo from "./Logo";

const navItems = [
  { href: "/men", key: "men" },
  { href: "/women", key: "women" },
  { href: "/about", key: "about" },
] as const;

export default async function Navbar() {
  const t = await getTranslations("nav");

  return (
    <header className="border-b border-border-light bg-bg-secondary text-fg-secondary">
      <div className="mx-auto flex min-h-20 max-w-[var(--max-content)] items-center ps-6 pe-6 md:ps-10 md:pe-10">
        <div className="flex flex-1 items-center justify-start">
          <Link href="/" aria-label="Kairova home">
            <Logo />
          </Link>
        </div>

        <nav
          className="hidden flex-1 items-center justify-center gap-8 md:flex"
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-caption font-medium uppercase text-fg-secondary transition-colors hover:text-fg-muted"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-3">
          <LocaleSwitcher />
          <CartLink />
        </div>
      </div>
    </header>
  );
}
