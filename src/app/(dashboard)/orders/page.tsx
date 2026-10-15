import { getOrders } from "@/lib/queries/orders";
import { OrdersView } from "@/components/orders/orders-view";

type SearchParams = Promise<{
  q?: string;
  status?: string;
}>;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const orders = await getOrders({
    search: params.q,
    status: params.status,
  });

  return (
    <OrdersView
      orders={orders}
      searchQuery={params.q}
      statusFilter={params.status}
    />
  );
}
