export type PaymentProofLabelKey = "deposit" | "remainingBalance";

export const paymentProofLabelKeys: PaymentProofLabelKey[] = [
  "deposit",
  "remainingBalance",
];

export function getPaymentProofLabelKey(label?: string | null) {
  if (!label) {
    return null;
  }

  const normalizedLabel = label.trim().toLowerCase().replace(/[\s_-]+/g, "");

  if (normalizedLabel === "deposit") {
    return "deposit";
  }

  if (normalizedLabel === "remainingbalance") {
    return "remainingBalance";
  }

  return null;
}
