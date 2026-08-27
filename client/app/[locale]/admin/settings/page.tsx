"use client";

import type { AxiosError } from "axios";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";

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
  walletNumber: string;
  vodafoneCashNumber: string;
  whatsappNumber: string;
};

const emptyForm: SettingsForm = {
  depositPercentage: "50",
  walletNumber: "",
  vodafoneCashNumber: "",
  whatsappNumber: "",
};

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ErrorResponse>;

  return axiosError.response?.data?.message || fallback;
}

function settingsToForm(settings: AdminSettings): SettingsForm {
  return {
    depositPercentage: String(settings.depositPercentage),
    walletNumber: settings.walletNumber,
    vodafoneCashNumber: settings.vodafoneCashNumber,
    whatsappNumber: settings.whatsappNumber,
  };
}

export default function AdminSettingsPage() {
  const t = useTranslations("admin");
  const { data: settings, isError, isLoading } = useAdminSettings();
  const updateSettings = useUpdateSettings();
  const [editedForm, setEditedForm] = useState<SettingsForm | null>(null);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const initialForm = settings ? settingsToForm(settings) : emptyForm;
  const form = editedForm ?? initialForm;

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
        walletNumber: form.walletNumber,
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
    return <p className="py-8 text-body text-fg-muted">{t("loading")}</p>;
  }

  if (isError) {
    return (
      <p className="py-8 text-body text-red-600">{t("loadSettingsFailed")}</p>
    );
  }

  return (
    <section className="max-w-2xl">
      <h2 className="mb-6 text-h2 leading-heading">{t("settings")}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="border border-border-light p-5 dark:border-border-subtle">
          <h3 className="mb-4 text-h3 leading-heading">
            {t("businessConfig")}
          </h3>

          <div className="space-y-4">
            <div>
              <label
                className="mb-2 block text-caption"
                htmlFor="deposit-percentage"
              >
                {t("depositPercentage")}
              </label>
              <input
                id="deposit-percentage"
                type="number"
                value={form.depositPercentage}
                onChange={(event) =>
                  updateField("depositPercentage", event.target.value)
                }
                min={0}
                max={100}
                required
                className="w-full border border-border-light bg-transparent px-3 py-2 dark:border-border-subtle"
              />
            </div>

            <div>
              <label className="mb-2 block text-caption" htmlFor="wallet-number">
                {t("walletNumber")}
              </label>
              <input
                id="wallet-number"
                type="text"
                value={form.walletNumber}
                onChange={(event) =>
                  updateField("walletNumber", event.target.value)
                }
                className="w-full border border-border-light bg-transparent px-3 py-2 dark:border-border-subtle"
                placeholder="01000000000"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-caption"
                htmlFor="vodafone-cash-number"
              >
                {t("vodafoneNumber")}
              </label>
              <input
                id="vodafone-cash-number"
                type="text"
                value={form.vodafoneCashNumber}
                onChange={(event) =>
                  updateField("vodafoneCashNumber", event.target.value)
                }
                className="w-full border border-border-light bg-transparent px-3 py-2 dark:border-border-subtle"
                placeholder="01000000000"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-caption"
                htmlFor="whatsapp-number"
              >
                {t("whatsappNumber")}
              </label>
              <input
                id="whatsapp-number"
                type="text"
                value={form.whatsappNumber}
                onChange={(event) =>
                  updateField("whatsappNumber", event.target.value)
                }
                required
                className="w-full border border-border-light bg-transparent px-3 py-2 dark:border-border-subtle"
                placeholder="201234567890"
              />
            </div>
          </div>
        </section>

        {actionError && (
          <p className="text-body text-red-600">{actionError}</p>
        )}

        {successMessage && (
          <p className="text-body text-emerald-700 dark:text-emerald-300">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={updateSettings.isPending}
          className="w-full border border-fg-secondary bg-fg-secondary px-4 py-4 text-bg-secondary disabled:opacity-50 dark:border-fg-primary dark:bg-fg-primary dark:text-bg-primary"
        >
          {updateSettings.isPending ? t("processing") : t("saveSettings")}
        </button>
      </form>
    </section>
  );
}
