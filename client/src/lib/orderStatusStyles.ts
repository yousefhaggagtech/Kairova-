import { createElement } from "react";
import {
  BadgeCheck,
  BookmarkCheck,
  Clock3,
  Package,
  Truck,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import type { OrderStatus } from "@/domain/entities/api";

type OrderStatusStyle = {
  classes: string;
  Icon: LucideIcon;
};

const orderStatusStyles: Record<OrderStatus, OrderStatusStyle> = {
  PENDING_DEPOSIT: {
    classes:
      "border-border-light bg-bg-secondary text-fg-secondary dark:border-border-subtle dark:bg-bg-primary dark:text-fg-primary",
    Icon: Clock3,
  },
  RESERVED: {
    classes:
      "border-fg-secondary/20 bg-surface-light text-fg-secondary dark:border-fg-primary/24 dark:bg-surface-dark dark:text-fg-primary",
    Icon: BookmarkCheck,
  },
  PACKED: {
    classes:
      "border-border-light bg-surface-light text-fg-secondary dark:border-border-subtle dark:bg-surface-dark dark:text-fg-primary",
    Icon: Package,
  },
  FULLY_PAID: {
    classes:
      "border-fg-secondary bg-fg-secondary text-bg-secondary dark:border-fg-primary dark:bg-fg-primary dark:text-bg-primary",
    Icon: BadgeCheck,
  },
  CONFIRMED_SHIPPED: {
    classes:
      "border-fg-secondary/32 bg-bg-secondary text-fg-secondary dark:border-fg-primary/40 dark:bg-bg-primary dark:text-fg-primary",
    Icon: Truck,
  },
  CANCELLED: {
    classes:
      "border-border-light bg-bg-secondary text-fg-muted dark:border-border-subtle dark:bg-bg-primary dark:text-fg-muted",
    Icon: XCircle,
  },
};

export function getOrderStatusClasses(status: OrderStatus) {
  return orderStatusStyles[status].classes;
}

export function getOrderStatusIcon(
  status: OrderStatus,
  className = "h-4 w-4 stroke-[1.6]",
) {
  const Icon = orderStatusStyles[status].Icon;

  return createElement(Icon, { "aria-hidden": true, className });
}

export function getOrderStatusStyle(status: OrderStatus) {
  return orderStatusStyles[status];
}
