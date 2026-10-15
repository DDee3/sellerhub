import { getShipments } from "@/lib/queries/shipments";
import { ShipmentsView } from "@/components/shipments/shipments-view";

type SearchParams = Promise<{
  q?: string;
  status?: string;
}>;

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const shipments = await getShipments({
    search: params.q,
    status: params.status,
  });

  return (
    <ShipmentsView
      shipments={shipments}
      searchQuery={params.q}
      statusFilter={params.status}
    />
  );
}
