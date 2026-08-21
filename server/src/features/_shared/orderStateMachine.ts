export const ORDER_STATUSES = [
  "PENDING_DEPOSIT",
  "RESERVED",
  "PACKED",
  "FULLY_PAID",
  "CONFIRMED_SHIPPED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_DEPOSIT: ["RESERVED", "CANCELLED"],
  RESERVED: ["PACKED", "CANCELLED"],
  PACKED: ["FULLY_PAID", "CANCELLED"],
  FULLY_PAID: ["CONFIRMED_SHIPPED", "CANCELLED"],
  CONFIRMED_SHIPPED: [],
  CANCELLED: [],
};

export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function requiresRefund(fromStatus: OrderStatus): boolean {
  return ["RESERVED", "PACKED", "FULLY_PAID"].includes(fromStatus);
}

export function hasDecrementedStock(fromStatus: OrderStatus): boolean {
  return [
    "RESERVED",
    "PACKED",
    "FULLY_PAID",
    "CONFIRMED_SHIPPED",
  ].includes(fromStatus);
}
