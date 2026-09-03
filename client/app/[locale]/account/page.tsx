"use client";

import { MapPinned, PackageCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAddresses } from "@/application/hooks/useAddresses";
import { useMyOrders } from "@/application/hooks/useOrders";
import { useAuthStore } from "@/application/store/authStore";
import { Link } from "@/src/i18n/navigation";

export default function AccountPage() {
  const t = useTranslations("account");
  const user = useAuthStore((state) => state.user);
  const { data: orders = [], isLoading: ordersLoading } = useMyOrders(
    Boolean(user),
  );
  const { data: addresses = [], isLoading: addressesLoading } = useAddresses(
    Boolean(user),
  );

  if (!user) {
    return null;
  }

  const activeOrders = orders.filter(
    (order) =>
      order.status !== "CANCELLED" &&
      order.status !== "CONFIRMED_SHIPPED",
  ).length;
  const defaultAddress = addresses.find((address) => address.isDefault);
  const cards = [
    {
      href: "/account/orders",
      title: t("orders"),
      body: t("manageOrders"),
      metric: ordersLoading
        ? t("loading")
        : t("activeOrdersCount", { count: activeOrders }),
      Icon: PackageCheck,
    },
    {
      href: "/account/addresses",
      title: t("addresses"),
      body: defaultAddress
        ? t("defaultAddressName", {
            name: defaultAddress.nickname || defaultAddress.fullName,
          })
        : t("manageAddresses"),
      metric: addressesLoading
        ? t("loading")
        : t("savedAddressesCount", { count: addresses.length }),
      Icon: MapPinned,
    },
  ];

  return (
    <section className="space-y-8">
      <div className="border-y border-border-light bg-bg-secondary py-8 sm:py-10">
        <div className="px-5 sm:px-6 lg:px-8">
          <p className="text-caption uppercase text-fg-muted">
            {t("overviewEyebrow")}
          </p>
          <h2 className="mt-3 text-h1 leading-heading">
            {t("overviewTitle", { name: user.name })}
          </h2>
          <p className="mt-4 max-w-2xl text-body-lg leading-body text-fg-muted">
            {t("overviewLead")}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {cards.map(({ href, title, body, metric, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group border border-border-light bg-bg-secondary p-6 transition-colors hover:border-fg-secondary hover:bg-surface-light focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-fg-secondary"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-caption uppercase text-fg-muted">{metric}</p>
                <h3 className="mt-4 text-h3 leading-heading">{title}</h3>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-border-light bg-bg-secondary transition-colors group-hover:border-fg-secondary">
                <Icon aria-hidden="true" className="h-5 w-5 stroke-[1.5]" />
              </span>
            </div>
            <p className="mt-6 max-w-lg text-body leading-body text-fg-muted">
              {body}
            </p>
          </Link>
        ))}
      </div>

      <section className="border border-border-light bg-bg-secondary p-6">
        <p className="text-caption uppercase text-fg-muted">
          {t("profileSnapshot")}
        </p>
        <dl className="mt-5 grid gap-5 text-body sm:grid-cols-3">
          <div>
            <dt className="text-caption text-fg-muted">{t("name")}</dt>
            <dd className="mt-1 break-words font-medium">{user.name}</dd>
          </div>
          <div>
            <dt className="text-caption text-fg-muted">{t("email")}</dt>
            <dd className="mt-1 break-words font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-caption text-fg-muted">{t("phone")}</dt>
            <dd className="mt-1 break-words font-medium">
              {user.phone || t("notProvided")}
            </dd>
          </div>
        </dl>
      </section>
    </section>
  );
}
