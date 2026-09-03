"use client";

import type { AxiosError } from "axios";
import { useLocale, useTranslations } from "next-intl";
import type { FormEvent } from "react";
import { useState } from "react";

import { useAuthStore } from "@/application/store/authStore";
import AuthPageShell, {
  AuthFieldLabel,
  authErrorClassName,
  authInputClassName,
  authPasswordInputClassName,
  authSubmitButtonClassName,
} from "@/components/auth/AuthPageShell";
import PasswordInput from "@/components/form/PasswordInput";
import { useRouter } from "@/src/i18n/navigation";

type ErrorResponse = {
  message?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ErrorResponse>;
  return axiosError.response?.data?.message || fallback;
}

function getRedirectPath(redirect: string | null, locale: string) {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return "/";
  }

  const localePrefix = `/${locale}`;

  if (redirect === localePrefix) {
    return "/";
  }

  if (redirect.startsWith(`${localePrefix}/`)) {
    return redirect.slice(localePrefix.length);
  }

  return redirect;
}

function getCurrentRedirect() {
  if (typeof window === "undefined") {
    return null;
  }

  return new URL(window.location.href).searchParams.get("redirect");
}

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations("auth");
  const router = useRouter();

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const user = await login(email, password);

      if (user.role === "admin") {
        router.push("/admin/orders");
        return;
      }

      router.push(getRedirectPath(getCurrentRedirect(), locale));
    } catch (loginError) {
      setError(getErrorMessage(loginError, t("loginFailed")));
    }
  };

  return (
    <AuthPageShell
      eyebrow={t("loginEyebrow")}
      highlights={[
        t("highlightReservations"),
        t("highlightProof"),
        t("highlightDelivery"),
      ]}
      imageAlt={t("imageAlt")}
      intro={t("loginIntro")}
      panelBody={t("experienceBody")}
      panelTitle={t("experienceTitle")}
      switchHref="/auth/register"
      switchLabel={t("register")}
      switchPrompt={t("noAccount")}
      title={t("login")}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block" htmlFor="email">
            <AuthFieldLabel>{t("email")}</AuthFieldLabel>
          </label>
          <input
            id="email"
            autoComplete="email"
            disabled={isLoading}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className={authInputClassName}
          />
        </div>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          className={authPasswordInputClassName}
          disabled={isLoading}
          label={<AuthFieldLabel>{t("password")}</AuthFieldLabel>}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          revealLabel={t("showPassword")}
          hideLabel={t("hidePassword")}
        />

        {error && (
          <p className={authErrorClassName} role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={authSubmitButtonClassName}
        >
          {isLoading ? t("loading") : t("loginButton")}
        </button>
      </form>
    </AuthPageShell>
  );
}
