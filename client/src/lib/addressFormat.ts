import type { Address, ShippingAddress } from "@/domain/entities/api";

type DisplayAddress = Partial<Address & ShippingAddress>;

const hasText = (value: string | undefined): value is string =>
  Boolean(value?.trim());

export function getAddressDisplayName(address: DisplayAddress) {
  return (
    address.nickname ||
    address.fullName ||
    address.label ||
    address.phone ||
    ""
  );
}

export function formatAddressLines(address: DisplayAddress) {
  const unitDetails = [address.building, address.floor, address.apartment]
    .filter(hasText)
    .join(" / ");

  return [
    address.street,
    address.area,
    address.city || address.governorate,
    unitDetails,
    address.notes,
  ].filter(hasText);
}

export function toShippingAddress(address: Address | AddressInputLike) {
  return {
    nickname: address.nickname,
    fullName: address.fullName,
    phone: address.phone,
    city: address.city,
    area: address.area,
    street: address.street,
    building: address.building,
    floor: address.floor,
    apartment: address.apartment,
    notes: address.notes,
  };
}

type AddressInputLike = Omit<Address, "_id" | "isDefault">;
