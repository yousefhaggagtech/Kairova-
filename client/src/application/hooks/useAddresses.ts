import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Address, AddressInput } from "@/domain/entities/api";
import { addressesApi } from "@/infrastructure/api/addressesApi";

export const addressQueryKey = ["account-addresses"] as const;

function updateAddressCache(
  queryClient: ReturnType<typeof useQueryClient>,
  addresses: Address[],
) {
  queryClient.setQueryData(addressQueryKey, addresses);
}

export function useAddresses(enabled = true) {
  return useQuery({
    queryKey: addressQueryKey,
    queryFn: addressesApi.list,
    enabled,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addressesApi.create,
    onSuccess: (addresses) => updateAddressCache(queryClient, addresses),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AddressInput>;
    }) => addressesApi.update({ id, data }),
    onSuccess: (addresses) => updateAddressCache(queryClient, addresses),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addressesApi.remove,
    onSuccess: (addresses) => updateAddressCache(queryClient, addresses),
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addressesApi.setDefault,
    onSuccess: (addresses) => updateAddressCache(queryClient, addresses),
  });
}
