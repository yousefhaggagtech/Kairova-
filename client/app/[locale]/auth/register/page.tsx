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

export default function RegisterPage() {
  const locale = useLocale();
  const t = useTranslations("auth");
  const router = useRouter();

  const registerUser = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await registerUser(name, email, password, phone);
      router.push(`/${locale}`);
    } catch (registerError) {
      setError(getErrorMessage(registerError, t("registerFailed")));
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="mb-8 text-h1 leading-heading">{t("register")}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block" htmlFor="name">
            {t("name")}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={2}
            maxLength={50}
            className="w-full border border-border-light bg-transparent p-3 dark:border-border-subtle"
          />
        </div>
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
          <label className="mb-2 block" htmlFor="phone">
            {t("phone")}
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
            pattern="^\+?[0-9]{10,15}$"
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
            minLength={8}
            className="w-full border border-border-light bg-transparent p-3 dark:border-border-subtle"
          />
        </div>

        {error && <p className="text-body text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-fg-secondary py-4 text-bg-secondary disabled:opacity-50 dark:bg-fg-primary dark:text-bg-primary"
        >
          {isLoading ? t("loading") : t("registerButton")}
        </button>
      </form>

      <p className="mt-6 text-center text-body">
        {t("alreadyAccount")}{" "}
        <Link href="/auth/login" className="underline">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
