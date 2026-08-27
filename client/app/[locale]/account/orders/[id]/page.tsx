"use client";

import { useParams } from "next/navigation";

import CustomerOrderDetail from "@/components/orders/CustomerOrderDetail";

function getId(idParam: string | string[] | undefined) {
  return Array.isArray(idParam) ? idParam[0] : idParam || "";
}

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const orderId = getId(params.id);

  return <CustomerOrderDetail orderId={orderId} />;
}
