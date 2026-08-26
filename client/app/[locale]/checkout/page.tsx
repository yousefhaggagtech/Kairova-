"use client";

import type { AxiosError } from "axios";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { useCreateOrder } from "@/application/hooks/useOrders";
import { useAuthStore } from "@/application/store/authStore";
import { useCartStore } from "@/application/store/cartStore";
import type { ShippingAddress } from "@/domain/entities/api";

type SupportedLocale = "ar" | "en";
type ErrorResponse = {
  message?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ErrorResponse>;
  return axiosError.response?.data?.message || fallback;
}

export default function CheckoutPage() {
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("checkout");
  const tCatalog = useTranslations("catalog");
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authHydrated = useAuthStore((state) => state.hasHydrated);
  const loadCurrentUser = useAuthStore((state) => state.loadCurrentUser);

  const items = useCartStore((state) => state.items);
  const cartHydrated = useCartStore((state) => state.hasHydrated);
  const setShippingAddress = useCartStore((state) => state.setShippingAddress);
  const clearCart = useCartStore((state) => state.clear);
  const total = useCartStore((state) => state.getTotal());

  const createOrder = useCreateOrder();
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState<ShippingAddress>({
    label: "Home",
    street: "",
    city: "",
    governorate: "Cairo",
    phone: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function verifyAuth() {
      if (!authHydrated) {
        return;
      }

      if (isAuthenticated && user) {
        setAuthChecked(true);
        return;
      }

      try {
        await loadCurrentUser();
        if (!cancelled) {
          setAuthChecked(true);
        }
      } catch {
        if (!cancelled) {
          router.replace(
            `/${locale}/auth/login?redirect=${encodeURIComponent(
              `/${locale}/checkout`,
            )}`,
          );
        }
      }
    }

    void verifyAuth();

    return () => {
      cancelled = true;
    };
  }, [
    authHydrated,
    isAuthenticated,
    loadCurrentUser,
    locale,
    router,
    user,
  ]);

  useEffect(() => {
    if (authChecked && cartHydrated && items.length === 0) {
      router.replace(`/${locale}/cart`);
    }
  }, [authChecked, cartHydrated, items.length, locale, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const order = await createOrder.mutateAsync({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: address,
      });

      setShippingAddress(address);
      clearCart();
      router.push(`/${locale}/checkout/confirmation/${order._id}`);
    } catch (checkoutError) {
      setError(getErrorMessage(checkoutError, t("checkoutFailed")));
    }
  };

  if (!authChecked || !cartHydrated || items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[var(--max-content)] px-4 py-12 text-body text-fg-muted md:px-10">
        {tCatalog("loading")}
      </div>
    );
  }

  const depositAmount = total * 0.5;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-h1 leading-heading">
        {t("shippingAddress")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block" htmlFor="address-label">
            {t("addressLabel")}
          </label>
          <input
            id="address-label"
            type="text"
            value={address.label}
            onChange={(event) =>
              setAddress({ ...address, label: event.target.value })
            }
            required
            className="w-full border border-border-light bg-transparent p-3 dark:border-border-subtle"
          />
        </div>
        <div>
          <label className="mb-2 block" htmlFor="street">
            {t("street")}
          </label>
          <input
            id="street"
            type="text"
            value={address.street}
            onChange={(event) =>
              setAddress({ ...address, street: event.target.value })
            }
            required
            className="w-full border border-border-light bg-transparent p-3 dark:border-border-subtle"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block" htmlFor="city">
              {t("city")}
            </label>
            <input
              id="city"
              type="text"
              value={address.city}
              onChange={(event) =>
                setAddress({ ...address, city: event.target.value })
              }
              required
              className="w-full border border-border-light bg-transparent p-3 dark:border-border-subtle"
            />
          </div>
          <div>
            <label className="mb-2 block" htmlFor="governorate">
              {t("governorate")}
            </label>
            <input
              id="governorate"
              type="text"
              value={address.governorate}
              onChange={(event) =>
                setAddress({ ...address, governorate: event.target.value })
              }
              required
              className="w-full border border-border-light bg-transparent p-3 dark:border-border-subtle"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block" htmlFor="phone">
            {t("phone")}
          </label>
          <input
            id="phone"
            type="tel"
            value={address.phone}
            onChange={(event) =>
              setAddress({ ...address, phone: event.target.value })
            }
            required
            pattern="^\+?[0-9]{10,15}$"
            className="w-full border border-border-light bg-transparent p-3 dark:border-border-subtle"
          />
        </div>

        <div className="mt-8 bg-surface-light p-6 dark:bg-surface-dark">
          <h2 className="mb-4 text-h3 leading-heading">
            {t("orderSummary")}
          </h2>
          <div className="mb-4 space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between gap-4">
                <span>
                  {item.name[locale] || item.name.en} x {item.quantity}
                </span>
                <span>
                  {(item.price * item.quantity).toLocaleString(locale)}{" "}
                  {tCatalog("egp")}
                </span>
              </div>
            ))}
          </div>
          <div className="mb-2 flex justify-between border-t border-border-light pt-4 dark:border-border-subtle">
            <span>{t("subtotal")}</span>
            <span>
              {total.toLocaleString(locale)} {tCatalog("egp")}
            </span>
          </div>
          <div className="flex justify-between text-body-lg font-medium">
            <span>{t("depositRequired")}</span>
            <span>
              {depositAmount.toLocaleString(locale)} {tCatalog("egp")} (50%)
            </span>
          </div>
        </div>

        {error && <p className="text-body text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={createOrder.isPending}
          className="w-full bg-fg-secondary py-4 text-bg-secondary disabled:opacity-50 dark:bg-fg-primary dark:text-bg-primary"
        >
          {createOrder.isPending ? t("processing") : t("placeReservation")}
        </button>
      </form>
    </div>
  );
}
