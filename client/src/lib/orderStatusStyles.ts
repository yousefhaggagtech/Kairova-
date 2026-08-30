import type { OrderStatus } from "@/domain/entities/api";

const orderStatusClasses: Record<OrderStatus, string> = {
  PENDING_DEPOSIT:
    "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-100",
  RESERVED:
    "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-100",
  PACKED:
    "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-100",
  FULLY_PAID:
    "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100",
  CONFIRMED_SHIPPED:
    "border-teal-300 bg-teal-50 text-teal-800 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-100",
  CANCELLED:
    "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/40 dark:text-red-100",
};

export function getOrderStatusClasses(status: OrderStatus) {
  return orderStatusClasses[status];
}
