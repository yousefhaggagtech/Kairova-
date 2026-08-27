"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/application/store/authStore";
import { Link } from "@/src/i18n/navigation";

type IconName = "login" | "account" | "admin" | "logout";

function AuthIcon({ name }: { name: IconName }) {
  if (name === "admin") {
    return (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d="M12 3 5 6v5c0 4.5 3 8.4 7 10 4-1.6 7-5.5 7-10V6l-7-3Z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 3v18" />
      </svg>
    );
  }

  if (name === "login") {
    return (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d="M14 7l5 5-5 5" />
        <path d="M19 12H8" />
        <path d="M4 4v16" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

const authControlClass =
  "inline-flex h-10 w-10 items-center justify-center border border-border-light text-fg-secondary transition-colors hover:bg-surface-light disabled:cursor-not-allowed disabled:opacity-50 dark:border-border-subtle";

export default function AuthNav() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("nav");
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const loadCurrentUser = useAuthStore((state) => state.loadCurrentUser);
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    let cancelled = false;

    if (!hasHydrated || !isAuthenticated || !userId) {
      return;
    }

    async function refreshCurrentUser() {
      try {
        await loadCurrentUser();
      } catch {
        if (!cancelled) {
          // The store clears itself when /me fails; the logged-out link will render.
        }
      }
    }

    void refreshCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, isAuthenticated, loadCurrentUser, userId]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      router.push(`/${locale}`);
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!hasHydrated || !isAuthenticated || !user) {
    return (
      <Link
        href="/auth/login"
        aria-label={t("login")}
        title={t("login")}
        className={authControlClass}
      >
        <AuthIcon name="login" />
      </Link>
    );
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="inline-flex items-center gap-2">
      <Link
        href={isAdmin ? "/admin/orders" : "/account/orders"}
        aria-label={isAdmin ? t("adminDashboard") : t("account")}
        title={isAdmin ? t("adminDashboard") : t("account")}
        className={authControlClass}
      >
        <AuthIcon name={isAdmin ? "admin" : "account"} />
      </Link>
      <button
        type="button"
        aria-label={t("logout")}
        title={t("logout")}
        disabled={isLoading || isLoggingOut}
        onClick={() => void handleLogout()}
        className={authControlClass}
      >
        <AuthIcon name="logout" />
      </button>
    </div>
  );
}
