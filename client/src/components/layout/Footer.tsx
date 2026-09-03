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

function SocialIcon({ type }: { type: "instagram" | "facebook" | "mail" }) {
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

  if (type === "facebook") {
    return (
      <svg {...commonProps}>
        <path d="M14.75 8.25h2.5V4.5h-2.5c-3.04 0-4.75 1.79-4.75 4.54V12H6.5v3.75h3.5V21h3.75v-5.25h3.25L17 12h-3.25V9.75c0-.76.5-1.5 1.5-1.5Z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="m5.75 7 6.25 5 6.25-5" />
    </svg>
  );
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

  const social = [
    { label: t("connect.instagram"), href: "https://www.instagram.com/kairova_co/", external: true },
    { label: t("connect.facebook"), href: "https://facebook.com", external: true },
    { label: t("connect.email"), href: "mailto:hello@kairova.com", external: true },
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
                          {item.label === t("connect.instagram") ? <SocialIcon type="instagram" /> : item.label === t("connect.facebook") ? <SocialIcon type="facebook" /> : <SocialIcon type="mail" />}
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
