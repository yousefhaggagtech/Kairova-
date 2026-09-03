"use client";

import { useTranslations } from "next-intl";

import type { Address, AddressInput } from "@/domain/entities/api";

export type AddressFormValue = AddressInput;
export type AddressTextField = Exclude<keyof AddressInput, "isDefault">;

type AddressFieldConfig = {
  id: AddressTextField;
  required?: boolean;
  type?: "tel" | "text";
  inputMode?: "tel";
  pattern?: string;
  className?: string;
};

type AddressFormFieldsProps = {
  value: AddressFormValue;
  onChange: (field: AddressTextField, value: string) => void;
  showDefaultField?: boolean;
  onDefaultChange?: (value: boolean) => void;
};

const phonePattern = "^\\+?[0-9]{10,15}$";

export const emptyAddressFormValue: AddressFormValue = {
  fullName: "",
  phone: "",
  city: "",
  area: "",
  street: "",
  building: "",
  apartment: "",
  isDefault: false,
};

export const addressFields: AddressFieldConfig[] = [
  { id: "fullName", required: true },
  {
    id: "phone",
    required: true,
    type: "tel",
    inputMode: "tel",
    pattern: phonePattern,
  },
  { id: "city", required: true },
  { id: "area" },
  { id: "street", required: true, className: "sm:col-span-2" },
  { id: "building" },
  { id: "apartment" },
];

export function addressToFormValue(address: Address): AddressFormValue {
  return {
    fullName: address.fullName,
    phone: address.phone,
    city: address.city,
    area: address.area ?? "",
    street: address.street,
    building: address.building ?? "",
    apartment: address.apartment ?? "",
    isDefault: address.isDefault,
  };
}

export default function AddressFormFields({
  value,
  onChange,
  showDefaultField = false,
  onDefaultChange,
}: AddressFormFieldsProps) {
  const t = useTranslations("account.addressFields");

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {addressFields.map((field) => (
        <div key={field.id} className={field.className}>
          <label
            className="mb-2 block text-caption font-medium text-fg-secondary/62"
            htmlFor={`address-${field.id}`}
          >
            {t(field.id)}
          </label>
          <input
            id={`address-${field.id}`}
            type={field.type || "text"}
            inputMode={field.inputMode}
            pattern={field.pattern}
            value={value[field.id] ?? ""}
            onChange={(event) => onChange(field.id, event.target.value)}
            required={field.required}
            className="h-14 w-full border border-border-light bg-bg-secondary px-4 text-body text-fg-secondary transition-colors placeholder:text-fg-muted focus:border-fg-secondary focus:outline-none"
          />
        </div>
      ))}

      {showDefaultField && (
        <label className="flex min-h-14 items-center gap-3 border border-border-light bg-bg-secondary px-4 text-body text-fg-secondary sm:col-span-2">
          <input
            type="checkbox"
            checked={Boolean(value.isDefault)}
            onChange={(event) => onDefaultChange?.(event.target.checked)}
            className="h-4 w-4 accent-black"
          />
          <span>{t("isDefault")}</span>
        </label>
      )}
    </div>
  );
}
