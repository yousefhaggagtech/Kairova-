"use client";

import type { AxiosError } from "axios";
import { CheckCircle2, MapPinned, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import { useState } from "react";

import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
} from "@/application/hooks/useAddresses";
import AddressFormFields, {
  addressToFormValue,
  emptyAddressFormValue,
  type AddressFormValue,
  type AddressTextField,
} from "@/components/account/AddressFormFields";
import type { Address } from "@/domain/entities/api";
import { formatAddressLines, getAddressDisplayName } from "@/lib/addressFormat";

type ErrorResponse = {
  message?: string;
};

type FormMode =
  | { type: "create" }
  | { type: "edit"; addressId: string }
  | null;

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ErrorResponse>;

  return axiosError.response?.data?.message || fallback;
}

export default function AccountAddressesPage() {
  const t = useTranslations("account");
  const { data: addresses = [], isError, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [formValue, setFormValue] = useState<AddressFormValue>({
    ...emptyAddressFormValue,
  });
  const [actionError, setActionError] = useState("");

  const actionPending =
    createAddress.isPending ||
    updateAddress.isPending ||
    deleteAddress.isPending ||
    setDefaultAddress.isPending;
  const isEditing = formMode?.type === "edit";

  const openCreateForm = () => {
    setActionError("");
    setFormMode({ type: "create" });
    setFormValue({ ...emptyAddressFormValue, isDefault: addresses.length === 0 });
  };

  const openEditForm = (address: Address) => {
    setActionError("");
    setFormMode({ type: "edit", addressId: address._id });
    setFormValue(addressToFormValue(address));
  };

  const closeForm = () => {
    setActionError("");
    setFormMode(null);
    setFormValue({ ...emptyAddressFormValue });
  };

  const handleFieldChange = (field: AddressTextField, value: string) => {
    setFormValue((currentValue) => ({
      ...currentValue,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionError("");

    try {
      if (formMode?.type === "edit") {
        const addressUpdate = { ...formValue };

        delete addressUpdate.isDefault;

        await updateAddress.mutateAsync({
          id: formMode.addressId,
          data: addressUpdate,
        });
      } else {
        await createAddress.mutateAsync(formValue);
      }

      closeForm();
    } catch (error) {
      setActionError(getErrorMessage(error, t("saveAddressFailed")));
    }
  };

  const handleDelete = async (address: Address) => {
    if (!window.confirm(t("confirmDeleteAddress"))) {
      return;
    }

    setActionError("");

    try {
      await deleteAddress.mutateAsync(address._id);
    } catch (error) {
      setActionError(getErrorMessage(error, t("deleteAddressFailed")));
    }
  };

  const handleSetDefault = async (address: Address) => {
    setActionError("");

    try {
      await setDefaultAddress.mutateAsync(address._id);
    } catch (error) {
      setActionError(getErrorMessage(error, t("setDefaultFailed")));
    }
  };

  if (isLoading) {
    return <p className="py-8 text-body text-fg-muted">{t("loading")}</p>;
  }

  return (
    <section className="space-y-8">
      <div className="border-y border-border-light bg-bg-secondary py-8 sm:py-10">
        <div className="flex flex-col gap-6 px-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="text-caption uppercase text-fg-muted">
              {t("addressesEyebrow")}
            </p>
            <h1 className="mt-3 text-3xl leading-heading sm:text-h1">{t("addressBook")}</h1>
            <p className="mt-4 max-w-2xl text-body-lg leading-body text-fg-muted">
              {t("addressesLead")}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex min-h-11 items-center justify-center gap-2 border border-fg-secondary px-5 text-body text-fg-secondary transition-colors hover:bg-fg-secondary hover:text-bg-secondary focus-visible:bg-fg-secondary focus-visible:text-bg-secondary focus-visible:outline-none"
          >
            <Plus aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />
            {t("addAddress")}
          </button>
        </div>
      </div>

      {isError && (
        <p className="border border-border-light bg-bg-secondary px-5 py-4 text-body text-fg-secondary">
          {t("loadAddressesFailed")}
        </p>
      )}

      {actionError && (
        <p className="border border-border-light bg-bg-secondary px-5 py-4 text-body text-fg-secondary">
          {actionError}
        </p>
      )}

      {formMode && (
        <section className="border border-border-light bg-surface-light p-5 sm:p-7">
          <div className="mb-6 border-b border-border-light pb-5">
            <p className="text-caption uppercase text-fg-muted">
              {isEditing ? t("editAddress") : t("newAddress")}
            </p>
            <h2 className="mt-2 text-h3 leading-heading">
              {isEditing ? t("editAddressTitle") : t("newAddressTitle")}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AddressFormFields
              value={formValue}
              onChange={handleFieldChange}
              showDefaultField
              onDefaultChange={(isDefault) =>
                setFormValue((currentValue) => ({
                  ...currentValue,
                  isDefault,
                }))
              }
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                className="min-h-11 border border-border-light px-5 text-body transition-colors hover:border-fg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                disabled={actionPending}
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={actionPending}
                className="min-h-11 border border-fg-secondary bg-fg-secondary px-5 text-body text-bg-secondary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionPending ? t("saving") : t("saveAddress")}
              </button>
            </div>
          </form>
        </section>
      )}

      {!isError && addresses.length === 0 && !formMode && (
        <section className="border border-border-light bg-bg-secondary p-6 text-center">
          <MapPinned
            aria-hidden="true"
            className="mx-auto h-8 w-8 stroke-[1.4]"
          />
          <h2 className="mt-5 text-h3 leading-heading">
            {t("noAddressesTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-body leading-body text-fg-muted">
            {t("noAddresses")}
          </p>
        </section>
      )}

      {!isError && addresses.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {addresses.map((address) => {
            const lines = formatAddressLines(address);

            return (
              <article
                key={address._id}
                className="border border-border-light bg-bg-secondary p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words text-caption uppercase text-fg-muted">
                      {address.phone}
                    </p>
                    <h2 className="mt-3 break-words text-h3 leading-heading">
                      {getAddressDisplayName(address)}
                    </h2>
                  </div>
                  {address.isDefault && (
                    <span className="inline-flex min-h-8 shrink-0 items-center gap-2 border border-fg-secondary/18 px-3 text-caption text-fg-secondary">
                      <CheckCircle2
                        aria-hidden="true"
                        className="h-3.5 w-3.5 stroke-[1.6]"
                      />
                      {t("defaultAddress")}
                    </span>
                  )}
                </div>

                <div className="mt-5 space-y-2 border-t border-border-light pt-5 text-body leading-body text-fg-muted">
                  <p className="font-medium text-fg-secondary">
                    {address.fullName}
                  </p>
                  {lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-border-light pt-5">
                  <button
                    type="button"
                    onClick={() => openEditForm(address)}
                    className="inline-flex min-h-11 items-center gap-2 border border-border-light px-3 text-body transition-colors hover:border-fg-secondary hover:bg-surface-light"
                  >
                    <Pencil
                      aria-hidden="true"
                      className="h-4 w-4 stroke-[1.6]"
                    />
                    {t("edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(address)}
                    disabled={actionPending}
                    className="inline-flex min-h-11 items-center gap-2 border border-border-light px-3 text-body transition-colors hover:border-fg-secondary hover:bg-surface-light disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2
                      aria-hidden="true"
                      className="h-4 w-4 stroke-[1.6]"
                    />
                    {t("delete")}
                  </button>
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => void handleSetDefault(address)}
                      disabled={actionPending}
                      className="inline-flex min-h-11 items-center gap-2 border border-border-light px-3 text-body transition-colors hover:border-fg-secondary hover:bg-surface-light disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2
                        aria-hidden="true"
                        className="h-4 w-4 stroke-[1.6]"
                      />
                      {t("setDefault")}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
