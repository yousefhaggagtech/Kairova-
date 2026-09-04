"use client";

import { motion, useInView } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRef } from "react";

import { Link } from "@/src/i18n/navigation";

import LocaleSwitcher from "./LocaleSwitcher";
import Logo from "./Logo";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type SocialIconType = "instagram" | "telegram" | "tiktok" | "support";

type SocialLink = FooterLink & {
  icon: SocialIconType;
};

const underlineLinkClass =
  "group relative inline-flex items-center text-sm text-[#A1A1A1] transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:outline-none";

function FooterLink({ label, href, external = false }: FooterLink) {
  const linkClassName = `${underlineLinkClass} ${external ? "cursor-pointer" : ""}`;

  const content = (
    <>
      <span>{label}</span>
      <span className="pointer-events-none absolute -bottom-1 left-1/2 h-px w-full -translate-x-1/2 origin-center scale-x-0 bg-white transition-all duration-300 ease-out group-hover:left-0 group-hover:translate-x-0 group-hover:scale-x-100 group-focus-visible:left-0 group-focus-visible:translate-x-0 group-focus-visible:scale-x-100" />
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        rel="noreferrer"
        target="_blank"
        className={linkClassName}
        aria-label={label}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={linkClassName} aria-label={label}>
      {content}
    </Link>
  );
}

function SocialIcon({ type }: { type: SocialIconType }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-4 w-4",
    "aria-hidden": true,
  };

  if (type === "instagram") {
    return (
      <svg {...commonProps}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
        <circle cx="12" cy="12" r="4.25" />
        <circle cx="17.25" cy="6.75" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (type === "telegram") {
    return (
      <svg {...commonProps}>
        <path d="M20.5 4.5 3.75 11.25c-.82.33-.79 1.5.05 1.78l4.42 1.47 1.72 4.66c.3.81 1.38.96 1.89.27l2.46-3.3 4.33 3.08c.72.51 1.72.08 1.86-.79L22 5.63c.13-.8-.75-1.44-1.5-1.13Z" />
        <path d="m8.22 14.5 7.53-5.3-5.81 9.96" />
      </svg>
    );
  }

  if (type === "tiktok") {
    return (
      <svg {...commonProps}>
        <path d="M14.5 3.75v10.12a4.13 4.13 0 1 1-4.13-4.12c.37 0 .73.05 1.06.14v3.48a1.38 1.38 0 1 0 .95 1.31V3.75h2.12Z" />
        <path d="M14.5 3.75c.28 2.5 1.95 4.7 4.5 5.25v3.1c-1.75-.05-3.32-.62-4.5-1.58" />
      </svg>
    );
  }

  if (type === "support") {
    return (
      <svg {...commonProps}>
        <path d="M4.25 12a7.75 7.75 0 0 1 13.2-5.55A7.75 7.75 0 0 1 12 19.75a7.65 7.65 0 0 1-3.7-.95l-4.05 1.05 1.08-3.92A7.66 7.66 0 0 1 4.25 12Z" />
        <path d="M9.25 10.25c.35 1.45 1.55 3.05 3.13 3.87.53.28 1.08.48 1.62.58l1-1.35c.15-.2.42-.27.65-.17l1.15.52" />
        <path d="m8.25 8.75.55 1.15c.1.23.03.5-.17.65l-1.18.88" />
      </svg>
    );
  }

  return null;
}

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.2 });
  const year = new Date().getFullYear();
  const statementFont = locale === "ar" ? "var(--font-display-ar)" : "var(--font-display-en)";

  const collections = [
    { label: t("collections.men"), href: "/men" },
    { label: t("collections.women"), href: "/women" },
    { label: t("collections.accessories"), href: "/category/men-accessories" },
  ];

  const support = [
    { label: t("support.shipping"), href: "/about" },
    { label: t("support.refunds"), href: "/about" },
    { label: t("support.faq"), href: "/about" },
  ];

  const company = [
    { label: t("company.about"), href: "/about" },
    { label: t("company.contact"), href: "/about" },
    { label: t("company.terms"), href: "/about" },
  ];

  const social: SocialLink[] = [
    {
      label: t("connect.instagram"),
      href: "https://www.instagram.com/kairova_co/",
      external: true,
      icon: "instagram",
    },
    {
      label: t("connect.telegram"),
      href: "https://tr.ee/BPVo2X_Niu",
      external: true,
      icon: "telegram",
    },
    {
      label: t("connect.tiktok"),
      href: "https://tr.ee/d_zP0_ebuK",
      external: true,
      icon: "tiktok",
    },
    {
      label: t("connect.support"),
      href: "https://tr.ee/KaD2Pehgh8",
      external: true,
      icon: "support",
    },
  ];

  return (
    <footer ref={footerRef} className="bg-[#0A0A0A] text-[#A1A1A1]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="border-t border-white/10"
      >
        <div className="mx-auto max-w-[var(--max-content)] px-6 py-12 sm:px-8 md:px-10 lg:px-12">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-start">
              <Logo className="h-auto w-28 md:w-36" width={140} />
              <p className="max-w-xl text-sm leading-relaxed tracking-[0.16em] text-[#F5F5F5] uppercase md:text-base" style={{ fontFamily: statementFont }}>
                {t("brandStatement")}
              </p>
            </div>

            <div className="grid gap-8 border-t border-white/10 pt-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-white" style={{ fontFamily: statementFont }}>
                  {t("collections.title")}
                </h3>
                <ul className="space-y-3">
                  {collections.map((item) => (
                    <li key={item.label}>
                      <FooterLink label={item.label} href={item.href} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-white" style={{ fontFamily: statementFont }}>
                  {t("support.title")}
                </h3>
                <ul className="space-y-3">
                  {support.map((item) => (
                    <li key={item.label}>
                      <FooterLink label={item.label} href={item.href} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-white" style={{ fontFamily: statementFont }}>
                  {t("company.title")}
                </h3>
                <ul className="space-y-3">
                  {company.map((item) => (
                    <li key={item.label}>
                      <FooterLink label={item.label} href={item.href} external={item.href.startsWith("mailto:")} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-white" style={{ fontFamily: statementFont }}>
                  {t("connect.title")}
                </h3>
                <ul className="space-y-3">
                  {social.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noreferrer" : undefined}
                        className="group relative inline-flex items-center gap-2 text-sm text-[#A1A1A1] transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:outline-none"
                        aria-label={item.label}
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-[#C7C7C7] transition-colors duration-300 group-hover:border-white/20 group-hover:text-white">
                          <SocialIcon type={item.icon} />
                        </span>
                        <span className="relative">
                          {item.label}
                          <span className="pointer-events-none absolute -bottom-1 left-1/2 h-px w-full -translate-x-1/2 origin-center scale-x-0 bg-white transition-all duration-300 ease-out group-hover:left-0 group-hover:translate-x-0 group-hover:scale-x-100 group-focus-visible:left-0 group-focus-visible:translate-x-0 group-focus-visible:scale-x-100" />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-5 text-xs text-[#A1A1A1] sm:flex-row sm:items-center sm:justify-between">
              <p>
                &copy; {year} Kairova. {t("rights")}
              </p>
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
