import Image from "next/image";
import type { ReactNode } from "react";

import { Link } from "@/src/i18n/navigation";

type AuthPageShellProps = {
  children: ReactNode;
  eyebrow: string;
  highlights: string[];
  imageAlt: string;
  intro: string;
  panelBody: string;
  panelTitle: string;
  switchHref: "/auth/login" | "/auth/register";
  switchLabel: string;
  switchPrompt: string;
  title: string;
};

const AUTH_IMAGE_SRC =
  "/auth-model-luna-pendant.png";

export const authInputClassName =
  "h-14 w-full border border-fg-secondary/15 bg-bg-secondary px-4 text-body text-fg-secondary outline-none transition-colors placeholder:text-fg-muted focus:border-fg-secondary disabled:cursor-not-allowed disabled:opacity-50 dark:border-border-subtle dark:bg-bg-primary dark:text-fg-primary dark:focus:border-fg-primary";

export const authPasswordInputClassName = `${authInputClassName} pe-12`;

export const authSubmitButtonClassName =
  "inline-flex min-h-14 w-full cursor-pointer items-center justify-center bg-fg-secondary px-6 py-4 text-caption font-medium uppercase text-bg-secondary transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-fg-secondary disabled:cursor-not-allowed disabled:opacity-50 dark:bg-fg-primary dark:text-bg-primary dark:focus-visible:outline-fg-primary";

export const authErrorClassName =
  "border border-fg-secondary/15 bg-surface-light px-4 py-3 text-caption leading-body text-fg-secondary dark:border-border-subtle dark:bg-surface-dark dark:text-fg-primary";

export function AuthFieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-caption font-medium text-fg-secondary/75 dark:text-fg-muted">
      {children}
    </span>
  );
}

export default function AuthPageShell({
  children,
  eyebrow,
  highlights,
  imageAlt,
  intro,
  panelBody,
  panelTitle,
  switchHref,
  switchLabel,
  switchPrompt,
  title,
}: AuthPageShellProps) {
  return (
    <section
      aria-labelledby="auth-page-heading"
      className="bg-bg-secondary px-4 py-8 text-fg-secondary sm:px-6 sm:py-16 md:px-10 lg:py-20 dark:bg-bg-primary dark:text-fg-primary"
    >
      <div className="mx-auto grid min-h-[calc(100svh-10rem)] w-full max-w-[var(--max-content)] overflow-hidden border border-border-light bg-bg-secondary shadow-[0_32px_100px_rgba(10,10,10,0.08)] lg:grid-cols-[minmax(0,0.9fr)_minmax(25rem,0.68fr)] dark:border-border-subtle dark:bg-bg-primary">
        <aside className="relative isolate flex min-h-[22rem] overflow-hidden bg-bg-primary text-fg-primary sm:min-h-[30rem]">
          <Image
            alt={imageAlt}
            className="object-cover object-center [filter:grayscale(1)_contrast(1.08)_brightness(0.68)]"
            fill
            preload
            quality={100}
            sizes="(min-width: 1024px) 56vw, 100vw"
            src={AUTH_IMAGE_SRC}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(10,10,10,0.88)_0%,rgba(10,10,10,0.58)_48%,rgba(10,10,10,0.28)_100%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_34%,rgba(255,255,255,0.08)_100%)]"
          />

          <div className="relative z-20 flex w-full flex-col justify-between gap-12 p-6 text-start sm:p-8 lg:p-10">
            <p className="text-body-lg font-medium text-border-light/82">
              Kairova
            </p>

            <div className="max-w-2xl">
              <p className="text-caption font-medium text-border-light/82">
                {eyebrow}
              </p>
              <h1
                id="auth-page-heading"
                className="mt-5 text-h2 leading-heading sm:text-h1"
              >
                {title}
              </h1>
              <p className="mt-5 max-w-xl text-body-lg leading-body text-border-light/82">
                {intro}
              </p>
            </div>
          </div>
        </aside>

        <div className="flex items-center px-5 py-8 sm:px-8 lg:px-12 lg:py-14">
          <div className="w-full text-start">
            <div className="border-b border-border-light pb-7 dark:border-border-subtle">
              <p className="text-caption font-medium text-fg-secondary/55 dark:text-fg-muted">
                {panelTitle}
              </p>
              <p className="mt-3 text-body leading-body text-fg-secondary/68 dark:text-fg-muted">
                {panelBody}
              </p>

              <ol className="mt-6 hidden gap-3 sm:grid">
                {highlights.map((highlight, index) => (
                  <li
                    key={highlight}
                    className="grid grid-cols-[2.5rem_1fr] items-start gap-3"
                  >
                    <span className="pt-0.5 text-caption font-medium text-fg-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-caption leading-body text-fg-secondary/72 dark:text-fg-muted">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="pt-7">{children}</div>

            <p className="mt-7 text-center text-body leading-body text-fg-muted">
              {switchPrompt}{" "}
              <Link
                href={switchHref}
                className="font-medium text-fg-secondary underline underline-offset-4 transition-colors hover:text-hover-muted focus-visible:text-hover-muted focus-visible:outline-none dark:text-fg-primary"
              >
                {switchLabel}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
