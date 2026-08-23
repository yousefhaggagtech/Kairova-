export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone?: string;
}

export interface LocalizedString {
  ar: string;
  en: string;
}

export interface Category {
  _id: string;
  name: LocalizedString;
  slug: string;
  gender: "men" | "women";
  parentCategory: string | null;
  deletedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: LocalizedString;
  description: LocalizedString;
  slug: string;
  gender: "men" | "women";
  category: Category | string;
  subcategory: Category | string | null;
  price: number;
  sku: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  images: ProductImage[];
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  _id: string;
  product?: Product | string;
  url: string;
  publicId?: string;
  alt: LocalizedString;
  isPrimary: boolean;
  order: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  product: Product | string;
  name: LocalizedString;
  unitPrice: number;
  quantity: number;
}

export interface ShippingAddress {
  label: string;
  street: string;
  city: string;
  governorate: string;
  phone: string;
}

export type OrderStatus =
  | "PENDING_DEPOSIT"
  | "RESERVED"
  | "PACKED"
  | "FULLY_PAID"
  | "CONFIRMED_SHIPPED"
  | "CANCELLED";

export type ShippingStatus = "pending" | "shipped" | "manual_required" | null;

export type RefundStatus = "not_required" | "pending" | "completed";

export interface Order {
  _id: string;
  orderNumber: string;
  customer: User | string;
  items: OrderItem[];
  subtotal: number;
  depositPercentage: number;
  depositAmount: number;
  remainingAmount: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  waybillNumber: string | null;
  shippingStatus?: ShippingStatus;
  cancellationReason: string | null;
  refundStatus: RefundStatus | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: "success" | "fail" | "error";
  data?: T;
  message?: string;
}
