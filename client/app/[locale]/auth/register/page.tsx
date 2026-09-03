"use client";

import type { AxiosError } from "axios";
import { useTranslations } from "next-intl";
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

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tSite = useTranslations("site");
  const router = useRouter();

  const registerUser = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    try {
      await registerUser(name, email, password, phone);
      router.push("/");
    } catch (registerError) {
      setError(getErrorMessage(registerError, t("registerFailed")));
    }
  };

  return (
    <AuthPageShell
      brandLabel={tSite("title")}
      eyebrow={t("registerEyebrow")}
      highlights={[
        t("highlightReservations"),
        t("highlightProof"),
        t("highlightDelivery"),
      ]}
      imageAlt={t("imageAlt")}
      intro={t("registerIntro")}
      panelBody={t("experienceBody")}
      panelTitle={t("experienceTitle")}
      switchHref="/auth/login"
      switchLabel={t("login")}
      switchPrompt={t("alreadyAccount")}
      title={t("register")}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block" htmlFor="name">
            <AuthFieldLabel>{t("name")}</AuthFieldLabel>
          </label>
          <input
            id="name"
            autoComplete="name"
            disabled={isLoading}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={2}
            maxLength={50}
            className={authInputClassName}
          />
        </div>
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
        <div>
          <label className="mb-2 block" htmlFor="phone">
            <AuthFieldLabel>{t("phone")}</AuthFieldLabel>
          </label>
          <input
            id="phone"
            autoComplete="tel"
            disabled={isLoading}
            inputMode="tel"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
            pattern="^\+?[0-9]{10,15}$"
            className={authInputClassName}
          />
        </div>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          className={authPasswordInputClassName}
          disabled={isLoading}
          label={<AuthFieldLabel>{t("password")}</AuthFieldLabel>}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          revealLabel={t("showPassword")}
          hideLabel={t("hidePassword")}
        />
        <PasswordInput
          id="confirm-password"
          autoComplete="new-password"
          className={authPasswordInputClassName}
          disabled={isLoading}
          label={<AuthFieldLabel>{t("confirmPassword")}</AuthFieldLabel>}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          minLength={8}
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
          {isLoading ? t("loading") : t("registerButton")}
        </button>
      </form>
    </AuthPageShell>
  );
}
