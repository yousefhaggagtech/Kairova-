"use client";

import type { AxiosError } from "axios";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

import { useAuthStore } from "@/application/store/authStore";
import { Link } from "@/src/i18n/navigation";

type ErrorResponse = {
  message?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ErrorResponse>;
  return axiosError.response?.data?.message || fallback;
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
      await login(email, password);
      router.push(`/${locale}/checkout`);
    } catch (loginError) {
      setError(getErrorMessage(loginError, t("loginFailed")));
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="mb-8 text-h1 leading-heading">{t("login")}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block" htmlFor="email">
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full border border-border-light bg-transparent p-3 dark:border-border-subtle"
          />
        </div>
        <div>
          <label className="mb-2 block" htmlFor="password">
            {t("password")}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full border border-border-light bg-transparent p-3 dark:border-border-subtle"
          />
        </div>

        {error && <p className="text-body text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-fg-secondary py-4 text-bg-secondary disabled:opacity-50 dark:bg-fg-primary dark:text-bg-primary"
        >
          {isLoading ? t("loading") : t("loginButton")}
        </button>
      </form>

      <p className="mt-6 text-center text-body">
        {t("noAccount")}{" "}
        <Link href="/auth/register" className="underline">
          {t("register")}
        </Link>
      </p>
    </div>
  );
}
