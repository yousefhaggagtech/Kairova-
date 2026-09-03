"use client";

import type { AxiosError } from "axios";
import { CheckCircle2, MapPinned, Plus } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useAddresses, useCreateAddress } from "@/application/hooks/useAddresses";
import { useAuthGuard } from "@/application/hooks/useAuthGuard";
import { useCreateOrder } from "@/application/hooks/useOrders";
import { usePublicSettings } from "@/application/hooks/useSettings";
import { useCartStore, type CartItem } from "@/application/store/cartStore";
import AddressFormFields, {
  emptyAddressFormValue,
  type AddressFormValue,
  type AddressTextField,
} from "@/components/account/AddressFormFields";
import OptimizedProductImage from "@/components/media/OptimizedProductImage";
import type {
  Address,
  PaymentMethod,
  ShippingAddress,
} from "@/domain/entities/api";
import {
  formatAddressLines,
  getAddressDisplayName,
  toShippingAddress,
} from "@/lib/addressFormat";
import type { Locale } from "@/src/i18n/config";
import { useRouter } from "@/src/i18n/navigation";

type CheckoutPageClientProps = {
  locale: Locale;
};

type ErrorResponse = {
  message?: string;
};

const PAYMENT_METHODS: PaymentMethod[] = ["vodafone_cash", "instapay"];

const RESERVATION_STEPS = [
  { id: "reserve", number: "01" },
  { id: "transfer", number: "02" },
  { id: "ship", number: "03" },
] as const;

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ErrorResponse>;
  return axiosError.response?.data?.message || fallback;
}

function formatCurrency(amount: number, locale: Locale, egpLabel: string) {
  const formattedAmount = new Intl.NumberFormat(
    locale === "ar" ? "ar-EG" : "en-EG",
    {
      maximumFractionDigits: 0,
    },
  ).format(amount);

  return locale === "ar"
    ? `${formattedAmount} ${egpLabel}`
    : `${egpLabel} ${formattedAmount}`;
}

function LoadingCheckout({ locale }: CheckoutPageClientProps) {
  const t = useTranslations("checkout");
  const isRtl = locale === "ar";

  return (
    <div
      className="bg-bg-secondary px-4 py-16 text-fg-secondary sm:px-6 sm:py-20 md:px-10 lg:py-24"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto w-full max-w-[var(--max-content)]">
        <p
          className={`text-caption font-medium text-fg-secondary/55 ${
            isRtl ? "" : "uppercase tracking-[0.32em]"
          }`}
        >
          {t("checkoutPage.eyebrow")}
        </p>
        <h1 className="mt-5 max-w-3xl text-h2 leading-heading sm:text-h1">
          {t("checkoutPage.loadingTitle")}
        </h1>
        <p className="mt-4 max-w-xl text-body-lg leading-body text-fg-secondary/68">
          {t("checkoutPage.loadingBody")}
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="space-y-6" aria-hidden="true">
            <div className="min-h-80 border border-border-light bg-bg-secondary p-6">
              <div className="h-4 w-24 bg-surface-light" />
              <div className="mt-5 h-8 w-1/2 bg-surface-light" />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="h-14 bg-surface-light" />
                ))}
              </div>
            </div>
            <div className="min-h-48 border border-border-light bg-bg-secondary p-6">
              <div className="h-4 w-28 bg-surface-light" />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="h-20 bg-surface-light" />
                <div className="h-20 bg-surface-light" />
              </div>
            </div>
          </div>
          <div
            className="min-h-96 border border-border-light bg-surface-light"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

function PaymentMethodLabel({ method }: { method: PaymentMethod }) {
  const t = useTranslations("checkout");
  return method === "vodafone_cash" ? t("vodafoneCash") : t("instapay");
}

function CompactLineItem({
  item,
  locale,
  egpLabel,
}: {
  item: CartItem;
  locale: Locale;
  egpLabel: string;
}) {
  const t = useTranslations("checkout");
  const productName = item.name[locale] || item.name.en;

  return (
    <li className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-4 py-4">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-light">
        {item.imageUrl ? (
          <OptimizedProductImage
            src={item.imageUrl}
            alt={productName}
            fill
            variant="thumbnail"
            sizes="68px"
            className="object-cover [filter:grayscale(0.18)_contrast(1.06)]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center px-2 text-center text-[0.64rem] text-fg-muted">
            {productName}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-body font-medium leading-heading">
          {productName}
        </p>
        <p className="mt-2 text-caption text-fg-muted">
          {t("checkoutPage.quantityLabel", { quantity: item.quantity })}
        </p>
        <p className="mt-3 text-body font-medium">
          {formatCurrency(item.price * item.quantity, locale, egpLabel)}
        </p>
      </div>
    </li>
  );
}

function SavedAddressOption({
  address,
  checked,
  onSelect,
}: {
  address: Address;
  checked: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations("checkout");
  const lines = formatAddressLines(address);

  return (
    <label
      className={`cursor-pointer border p-4 transition-colors ${
        checked
          ? "border-fg-secondary bg-bg-secondary shadow-[inset_0_0_0_1px_rgba(10,10,10,0.08)]"
          : "border-border-light bg-bg-secondary hover:border-fg-secondary/45"
      }`}
    >
      <input
        type="radio"
        name="shippingAddressId"
        checked={checked}
        onChange={onSelect}
        className="sr-only"
      />
      <span className="flex items-start justify-between gap-4">
        <span>
          <span className="block text-body-lg font-medium">
            {getAddressDisplayName(address)}
          </span>
          <span className="mt-2 block text-caption text-fg-muted">
            {address.fullName} / {address.phone}
          </span>
        </span>
        {address.isDefault && (
          <span className="inline-flex min-h-7 shrink-0 items-center gap-1.5 border border-fg-secondary/18 px-2 text-caption">
            <CheckCircle2
              aria-hidden="true"
              className="h-3.5 w-3.5 stroke-[1.6]"
            />
            {t("checkoutPage.defaultAddress")}
          </span>
        )}
      </span>
      {lines.length > 0 && (
        <span className="mt-4 block space-y-1 text-caption leading-body text-fg-muted">
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </span>
      )}
    </label>
  );
}

export default function CheckoutPageClient({ locale }: CheckoutPageClientProps) {
  const t = useTranslations("checkout");
  const tCatalog = useTranslations("catalog");
  const router = useRouter();
  const isRtl = locale === "ar";
  const { user, isChecking: isAuthChecking } = useAuthGuard("customer");

  const items = useCartStore((state) => state.items);
  const cartHydrated = useCartStore((state) => state.hasHydrated);
  const clearCart = useCartStore((state) => state.clear);
  const total = useCartStore((state) => state.getTotal());
  const itemCount = useCartStore((state) => state.getItemCount());

  const createOrder = useCreateOrder();
  const createAddress = useCreateAddress();
  const { data: settings, isLoading: isSettingsLoading } = usePublicSettings();
  const {
    data: addresses = [],
    isLoading: isAddressesLoading,
  } = useAddresses(!isAuthChecking && user?.role === "customer");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("vodafone_cash");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<AddressFormValue>({
    ...emptyAddressFormValue,
  });

  useEffect(() => {
    if (
      !isAuthChecking &&
      user?.role === "customer" &&
      cartHydrated &&
      items.length === 0 &&
      !isRedirecting
    ) {
      router.replace("/cart");
    }
  }, [cartHydrated, isAuthChecking, isRedirecting, items.length, router, user]);

  const defaultAddress = addresses.find((address) => address.isDefault);
  const selectedSavedAddress =
    addresses.find((address) => address._id === selectedAddressId) ??
    defaultAddress ??
    addresses[0] ??
    null;
  const shouldUseNewAddress =
    isAddingAddress || addresses.length === 0 || !selectedSavedAddress;

  const handleNewAddressChange = (field: AddressTextField, value: string) => {
    setNewAddress((currentAddress) => ({
      ...currentAddress,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsRedirecting(true);

    let shippingAddress: ShippingAddress | null = null;

    try {
      if (shouldUseNewAddress) {
        const addressInput = {
          ...newAddress,
          isDefault: newAddress.isDefault || addresses.length === 0,
        };

        await createAddress.mutateAsync(addressInput);
        shippingAddress = toShippingAddress(addressInput);
      } else if (selectedSavedAddress) {
        shippingAddress = toShippingAddress(selectedSavedAddress);
      }

      if (!shippingAddress) {
        setIsRedirecting(false);
        setError(t("checkoutPage.selectAddressRequired"));
        return;
      }

      const order = await createOrder.mutateAsync({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod,
        customerPhone: shippingAddress.phone,
      });

      clearCart();
      router.push(`/account/orders/${order._id}`);
    } catch (checkoutError) {
      setIsRedirecting(false);
      setError(getErrorMessage(checkoutError, t("checkoutFailed")));
    }
  };

  if (
    isAuthChecking ||
    !cartHydrated ||
    isSettingsLoading ||
    isAddressesLoading ||
    items.length === 0
  ) {
    return <LoadingCheckout locale={locale} />;
  }

  if (user?.role !== "customer") {
    return null;
  }

  const egpLabel = tCatalog("egp");
  const depositPercentage = settings?.depositPercentage ?? 50;
  const depositAmount = (total * depositPercentage) / 100;
  const remainingAmount = total - depositAmount;
  const selectedPaymentNumber =
    paymentMethod === "instapay"
      ? settings?.instapayNumber
      : settings?.vodafoneCashNumber;
  const isSubmitting =
    createOrder.isPending || createAddress.isPending || isRedirecting;

  return (
    <div
      className="bg-bg-secondary px-4 py-16 text-fg-secondary sm:px-6 sm:py-20 md:px-10 lg:py-24"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto w-full max-w-[var(--max-content)]">
        <section
          aria-labelledby="checkout-heading"
          className="grid gap-8 border-b border-border-light pb-10 text-start lg:grid-cols-[minmax(0,0.86fr)_minmax(20rem,0.44fr)] lg:items-end"
        >
          <div>
            <p
              className={`text-caption font-medium text-fg-secondary/55 ${
                isRtl ? "" : "uppercase tracking-[0.32em]"
              }`}
            >
              {t("checkoutPage.eyebrow")}
            </p>
            <h1
              id="checkout-heading"
              className="mt-5 max-w-4xl text-h2 leading-heading sm:text-h1"
            >
              {t("checkoutPage.title")}
            </h1>
            <p className="mt-5 max-w-2xl text-body-lg leading-body text-fg-secondary/68">
              {t("checkoutPage.intro")}
            </p>
          </div>

          <div className="border border-fg-secondary/12 bg-surface-light px-5 py-4">
            <p className="text-caption font-medium text-fg-muted">
              {t("checkoutPage.selectedPieces", { count: itemCount })}
            </p>
            <p className="mt-2 text-h3 leading-heading">
              {formatCurrency(depositAmount, locale, egpLabel)}
            </p>
            <p className="mt-2 text-caption text-fg-secondary/62">
              {t("checkoutPage.depositPreview", {
                percentage: depositPercentage,
              })}
            </p>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="grid gap-12 pt-12 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start"
        >
          <div className="space-y-8 text-start">
            <section
              aria-labelledby="delivery-details-heading"
              className="border border-border-light bg-surface-light p-5 sm:p-7"
            >
              <p
                className={`text-caption font-medium text-fg-secondary/55 ${
                  isRtl ? "" : "uppercase tracking-[0.24em]"
                }`}
              >
                {t("checkoutPage.addressEyebrow")}
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,0.66fr)_minmax(12rem,0.34fr)] md:items-start">
                <div>
                  <h2
                    id="delivery-details-heading"
                    className="text-h3 leading-heading"
                  >
                    {t("checkoutPage.addressTitle")}
                  </h2>
                  <p className="mt-3 max-w-xl text-body leading-body text-fg-secondary/66">
                    {t("checkoutPage.addressBody")}
                  </p>
                </div>
                <p
                  className={`border-t border-border-light pt-4 text-caption leading-body text-fg-muted md:border-t-0 md:px-5 md:pt-0 ${
                    isRtl ? "md:border-r" : "md:border-l"
                  }`}
                >
                  {t("checkoutPage.addressSideNote")}
                </p>
              </div>

              {addresses.length > 0 && (
                <fieldset className="mt-8">
                  <legend className="sr-only">
                    {t("checkoutPage.savedAddressTitle")}
                  </legend>
                  <div className="grid gap-3">
                    {addresses.map((address) => (
                      <SavedAddressOption
                        key={address._id}
                        address={address}
                        checked={
                          !shouldUseNewAddress &&
                          selectedSavedAddress?._id === address._id
                        }
                        onSelect={() => {
                          setSelectedAddressId(address._id);
                          setIsAddingAddress(false);
                        }}
                      />
                    ))}
                  </div>
                </fieldset>
              )}

              <button
                type="button"
                onClick={() => setIsAddingAddress(true)}
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 border border-fg-secondary px-5 text-body transition-colors hover:bg-fg-secondary hover:text-bg-secondary focus-visible:bg-fg-secondary focus-visible:text-bg-secondary focus-visible:outline-none"
              >
                <Plus aria-hidden="true" className="h-4 w-4 stroke-[1.6]" />
                {addresses.length > 0
                  ? t("checkoutPage.useNewAddress")
                  : t("checkoutPage.addFirstAddress")}
              </button>

              {shouldUseNewAddress && (
                <div className="mt-7 border-t border-border-light pt-7">
                  <div className="mb-6 flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-border-light bg-bg-secondary">
                      <MapPinned
                        aria-hidden="true"
                        className="h-5 w-5 stroke-[1.5]"
                      />
                    </span>
                    <div>
                      <h3 className="text-body-lg font-medium">
                        {t("checkoutPage.newAddressTitle")}
                      </h3>
                      <p className="mt-2 text-caption leading-body text-fg-muted">
                        {t("checkoutPage.newAddressBody")}
                      </p>
                    </div>
                  </div>
                  <AddressFormFields
                    value={newAddress}
                    onChange={handleNewAddressChange}
                    showDefaultField={addresses.length > 0}
                    onDefaultChange={(isDefault) =>
                      setNewAddress((currentAddress) => ({
                        ...currentAddress,
                        isDefault,
                      }))
                    }
                  />
                </div>
              )}
            </section>

            <section
              aria-labelledby="payment-method-heading"
              className="border border-border-light bg-surface-light p-5 sm:p-7"
            >
              <p
                className={`text-caption font-medium text-fg-secondary/55 ${
                  isRtl ? "" : "uppercase tracking-[0.24em]"
                }`}
              >
                {t("checkoutPage.paymentEyebrow")}
              </p>
              <h2
                id="payment-method-heading"
                className="mt-4 text-h3 leading-heading"
              >
                {t("checkoutPage.paymentTitle")}
              </h2>
              <p className="mt-3 max-w-2xl text-body leading-body text-fg-secondary/66">
                {t("checkoutPage.paymentBody")}
              </p>

              <fieldset className="mt-8">
                <legend className="sr-only">{t("paymentMethod")}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = paymentMethod === method;

                    return (
                      <label
                        key={method}
                        className={`cursor-pointer border px-5 py-4 text-body transition-colors ${
                          isSelected
                            ? "border-fg-secondary bg-surface-light text-fg-secondary shadow-[inset_0_0_0_1px_rgba(10,10,10,0.08)]"
                            : "border-border-light bg-bg-secondary text-fg-secondary hover:border-fg-secondary/45 hover:bg-bg-secondary"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={isSelected}
                          onChange={() => setPaymentMethod(method)}
                          className="sr-only"
                        />
                        <span className="block text-body-lg font-medium">
                          <PaymentMethodLabel method={method} />
                        </span>
                        <span
                          className={`mt-2 block text-caption ${
                            isSelected
                              ? "text-fg-secondary/68"
                              : "text-fg-muted"
                          }`}
                        >
                          {t(`checkoutPage.paymentMethods.${method}`)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="mt-7 grid gap-5 border-t border-border-light pt-6 md:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
                <div>
                  <p className="text-caption font-medium text-fg-muted">
                    {t("checkoutPage.paymentNumberTitle")}
                  </p>
                  <p className="mt-3 font-mono text-h3 leading-heading">
                    {selectedPaymentNumber || t("paymentNumberMissing")}
                  </p>
                </div>
                <p className="text-body leading-body text-fg-secondary/66">
                  {t("checkoutPage.paymentNumberBody")}
                </p>
              </div>
            </section>
          </div>

          <aside className="border border-fg-secondary/12 bg-surface-light p-6 text-start shadow-[0_24px_70px_rgba(10,10,10,0.08)] lg:sticky lg:top-28">
            <p
              className={`text-caption font-medium text-fg-secondary/55 ${
                isRtl ? "" : "uppercase tracking-[0.28em]"
              }`}
            >
              {t("checkoutPage.summaryEyebrow")}
            </p>
            <h2 className="mt-4 text-h3 leading-heading">
              {t("checkoutPage.summaryTitle")}
            </h2>
            <p className="mt-3 text-caption leading-body text-fg-muted">
              {t("checkoutPage.manualFlowNote")}
            </p>

            <div className="mt-7 border-y border-border-light">
              <p className="py-4 text-caption font-medium text-fg-muted">
                {t("checkoutPage.itemsTitle")}
              </p>
              <ul className="divide-y divide-border-light">
                {items.map((item) => (
                  <CompactLineItem
                    key={item.productId}
                    item={item}
                    locale={locale}
                    egpLabel={egpLabel}
                  />
                ))}
              </ul>
            </div>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4 text-body">
                <dt className="text-fg-muted">{t("subtotal")}</dt>
                <dd className="font-medium">
                  {formatCurrency(total, locale, egpLabel)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 text-body">
                <dt className="text-fg-muted">
                  {t("checkoutPage.depositDueNow")}
                </dt>
                <dd className="font-medium">
                  {formatCurrency(depositAmount, locale, egpLabel)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 text-body">
                <dt className="text-fg-muted">
                  {t("checkoutPage.remainingLater")}
                </dt>
                <dd className="font-medium">
                  {formatCurrency(remainingAmount, locale, egpLabel)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border-light pt-5 text-body-lg">
                <dt>{t("checkoutPage.fullTotal")}</dt>
                <dd className="font-medium">
                  {formatCurrency(total, locale, egpLabel)}
                </dd>
              </div>
            </dl>

            {error ? (
              <p
                role="alert"
                className="mt-6 border border-fg-secondary/18 bg-surface-light px-4 py-3 text-caption leading-body text-fg-secondary"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full cursor-pointer bg-fg-secondary px-6 py-4 text-caption font-medium uppercase text-bg-secondary transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-fg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? t("checkoutPage.processingTitle")
                : t("placeReservation")}
            </button>

            <p className="mt-5 text-caption leading-body text-fg-muted">
              {t("checkoutPage.submitNote")}
            </p>

            <div className="mt-8 border-t border-border-light pt-6">
              <h3 className="text-body font-medium">
                {t("checkoutPage.timelineTitle")}
              </h3>
              <ol className="mt-5 space-y-4">
                {RESERVATION_STEPS.map((step) => (
                  <li
                    key={step.id}
                    className="grid grid-cols-[2.5rem_1fr] gap-3"
                  >
                    <span className="text-caption font-medium text-fg-muted">
                      {step.number}
                    </span>
                    <span className="text-caption leading-body text-fg-secondary/70">
                      {t(`checkoutPage.steps.${step.id}`)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
