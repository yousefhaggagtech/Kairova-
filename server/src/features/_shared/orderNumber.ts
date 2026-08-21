import Order from "../../models/Order.js";
import AppError from "../../utils/AppError.js";

interface MongoDuplicateKeyError {
  code?: number;
  keyPattern?: Record<string, unknown>;
}

const isDuplicateOrderNumberError = (
  error: unknown,
): error is MongoDuplicateKeyError => {
  if (!error || typeof error !== "object") return false;

  const mongoError = error as MongoDuplicateKeyError;

  return mongoError.code === 11000 && Boolean(mongoError.keyPattern?.orderNumber);
};

export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `KRV-${year}-`;
  const count = await Order.countDocuments({
    orderNumber: { $regex: `^${prefix}` },
  });
  const number = String(count + 1).padStart(5, "0");

  return `${prefix}${number}`;
}

export async function createOrderWithUniqueNumber<T>(
  createFn: (orderNumber: string) => Promise<T>,
  maxRetries = 5,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    const orderNumber = await generateOrderNumber();

    try {
      return await createFn(orderNumber);
    } catch (error) {
      if (isDuplicateOrderNumberError(error)) {
        console.warn(
          `Order number collision on ${orderNumber}, retry ${attempt}/${maxRetries}`,
        );
        continue;
      }

      throw error;
    }
  }

  throw new AppError("Failed to generate unique order number after retries", 500);
}
