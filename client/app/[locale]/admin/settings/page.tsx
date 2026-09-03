"use client";

import type { AxiosError } from "axios";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useMemo, useState } from "react";

import {
  useAdminSettings,
  useUpdateSettings,
} from "@/application/hooks/useSettings";
import type { AdminSettings } from "@/infrastructure/api/settingsApi";

type ErrorResponse = {
  message?: string;
};

type SettingsForm = {
  depositPercentage: string;
  instapayNumber: string;
  vodafoneCashNumber: string;
  whatsappNumber: string;
};

type SettingsField = {
  field: keyof SettingsForm;
  id: string;
  inputMode?: "numeric" | "tel";
  label: string;
  max?: number;
  min?: number;
  placeholder?: string;
  required?: boolean;
  type: "number" | "text";
};

type SummaryItem = {
  label: string;
  value: string;
};

const emptyForm: SettingsForm = {
  depositPercentage: "50",
  instapayNumber: "",
  vodafoneCashNumber: "",
  whatsappNumber: "",
};

const inputClassName =
  "h-12 w-full border border-border-light bg-bg-secondary px-4 text-body text-fg-secondary transition-colors placeholder:text-fg-muted focus:border-fg-secondary focus:bg-bg-secondary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ErrorResponse>;

  return axiosError.response?.data?.message || fallback;
}

function settingsToForm(settings: AdminSettings): SettingsForm {
  return {
    depositPercentage: String(settings.depositPercentage),
    instapayNumber: settings.instapayNumber,
    vodafoneCashNumber: settings.vodafoneCashNumber,
    whatsappNumber: settings.whatsappNumber,
  };
}

function hasFormChanges(form: SettingsForm, initialForm: SettingsForm) {
  return (Object.keys(form) as Array<keyof SettingsForm>).some(
    (field) => form[field] !== initialForm[field],
  );
}

export default function AdminSettingsPage() {
  const locale = useLocale();
  const t = useTranslations("admin");
  const { data: settings, isError, isLoading } = useAdminSettings();
  const updateSettings = useUpdateSettings();
  const [editedForm, setEditedForm] = useState<SettingsForm | null>(null);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const initialForm = settings ? settingsToForm(settings) : emptyForm;
  const form = editedForm ?? initialForm;
  const missingValue = t("settingsMissingValue");
  const hasChanges = hasFormChanges(form, initialForm);
  const fields = useMemo<SettingsField[]>(
    () => [
      {
        field: "depositPercentage",
        id: "deposit-percentage",
        inputMode: "numeric",
        label: t("depositPercentage"),
        max: 100,
        min: 0,
        required: true,
        type: "number",
      },
      {
        field: "vodafoneCashNumber",
        id: "vodafone-cash-number",
        inputMode: "tel",
        label: t("vodafoneCashNumber"),
        placeholder: t("settingsPlaceholderLocalPhone"),
        type: "text",
      },
      {
        field: "instapayNumber",
        id: "instapay-number",
        inputMode: "tel",
        label: t("instapayNumber"),
        placeholder: t("settingsPlaceholderLocalPhone"),
        type: "text",
      },
      {
        field: "whatsappNumber",
        id: "whatsapp-number",
        inputMode: "tel",
        label: t("whatsappNumber"),
        placeholder: t("settingsPlaceholderWhatsapp"),
        required: true,
        type: "text",
      },
    ],
    [t],
  );
  const summaryItems = useMemo<SummaryItem[]>(
    () => {
      const parsedDepositPercentage = Number(form.depositPercentage);
      const depositValue =
        form.depositPercentage.trim() &&
        Number.isFinite(parsedDepositPercentage)
          ? t("settingsDepositPreview", {
              percentage: parsedDepositPercentage.toLocaleString(locale),
            })
          : missingValue;

      return [
        {
          label: t("settingsDepositPolicy"),
          value: depositValue,
        },
        {
          label: t("vodafoneCashNumber"),
          value: form.vodafoneCashNumber.trim() || missingValue,
        },
        {
          label: t("instapayNumber"),
          value: form.instapayNumber.trim() || missingValue,
        },
        {
          label: t("whatsappNumber"),
          value: form.whatsappNumber.trim() || missingValue,
        },
      ];
    },
    [form, locale, missingValue, t],
  );

  const updateField = (field: keyof SettingsForm, value: string) => {
    setEditedForm((currentForm) => ({
      ...(currentForm ?? initialForm),
      [field]: value,
    }));
    setActionError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionError("");
    setSuccessMessage("");

    try {
      const updatedSettings = await updateSettings.mutateAsync({
        depositPercentage: Number(form.depositPercentage),
        instapayNumber: form.instapayNumber,
        vodafoneCashNumber: form.vodafoneCashNumber,
        whatsappNumber: form.whatsappNumber,
      });
      setEditedForm(settingsToForm(updatedSettings));
      setSuccessMessage(t("settingsUpdated"));
    } catch (error) {
      setActionError(getErrorMessage(error, t("updateFailed")));
    }
  };

  if (isLoading) {
    return (
      <section className="border border-border-light bg-bg-secondary p-6">
        <p className="text-body text-fg-muted">{t("loading")}</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="border border-border-light bg-bg-secondary p-6">
        <p className="text-body text-fg-secondary">{t("loadSettingsFailed")}</p>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <section className="relative overflow-hidden border-y border-border-light bg-bg-secondary py-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,var(--color-bg-secondary)_0%,var(--color-surface-light)_48%,var(--color-bg-secondary)_100%)]" />
        <div className="pointer-events-none absolute end-0 top-0 hidden h-full w-2/5 border-s border-border-light bg-[repeating-linear-gradient(135deg,rgba(10,10,10,0.04)_0,rgba(10,10,10,0.04)_1px,transparent_1px,transparent_18px)] lg:block" />
        <div className="relative px-5 sm:px-6 lg:px-8">
          <p className="text-caption uppercase text-fg-muted">
            {t("settingsEyebrow")}
          </p>
          <h2 className="mt-4 text-3xl leading-heading text-fg-secondary sm:text-h1">
            {t("settings")}
          </h2>
          <p className="mt-4 max-w-2xl text-body-lg leading-body text-fg-muted">
            {t("settingsLead")}
          </p>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <section className="border border-border-light bg-bg-secondary p-5 sm:p-6">
          <div className="border-b border-border-light pb-5">
            <h3 className="text-h3 leading-heading text-fg-secondary">
              {t("businessConfig")}
            </h3>
            <p className="mt-3 max-w-2xl text-body leading-body text-fg-muted">
              {t("settingsFormLead")}
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {fields.map((field) => (
              <div key={field.field}>
                <label
                  className="mb-2 block text-caption font-medium uppercase text-fg-muted"
                  htmlFor={field.id}
                >
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type={field.type}
                  value={form[field.field]}
                  onChange={(event) =>
                    updateField(field.field, event.target.value)
                  }
                  min={field.min}
                  max={field.max}
                  inputMode={field.inputMode}
                  required={field.required}
                  className={inputClassName}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <section className="border border-border-light bg-bg-secondary p-5">
            <div className="flex flex-col gap-4 border-b border-border-light pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-caption uppercase text-fg-muted">
                  {t("settingsSummary")}
                </p>
                <h3 className="mt-2 text-body-lg font-semibold text-fg-secondary">
                  {t("businessConfig")}
                </h3>
              </div>
              <span
                className={`shrink-0 border px-3 py-1 text-caption ${
                  hasChanges
                    ? "border-fg-secondary bg-fg-secondary text-bg-secondary"
                    : "border-border-light bg-surface-light text-fg-muted"
                }`}
              >
                {hasChanges
                  ? t("settingsUnsavedChanges")
                  : t("settingsSavedState")}
              </span>
            </div>

            <dl className="divide-y divide-border-light">
              {summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="grid gap-2 py-4 sm:grid-cols-[0.75fr_1fr] lg:grid-cols-1"
                >
                  <dt className="text-caption uppercase text-fg-muted">
                    {item.label}
                  </dt>
                  <dd className="break-words text-body font-medium text-fg-secondary">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <div aria-live="polite" className="space-y-3">
            {actionError && (
              <p className="border border-fg-secondary bg-surface-light px-4 py-3 text-body text-fg-secondary">
                {actionError}
              </p>
            )}

            {successMessage && (
              <p className="border border-border-light bg-surface-light px-4 py-3 text-body text-fg-secondary">
                {successMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={updateSettings.isPending}
            className="min-h-12 w-full border border-fg-secondary bg-fg-secondary px-4 py-3 text-body font-medium text-bg-secondary transition-colors hover:bg-bg-absolute focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-fg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updateSettings.isPending ? t("processing") : t("saveSettings")}
          </button>
        </aside>
      </form>
    </section>
  );
}
