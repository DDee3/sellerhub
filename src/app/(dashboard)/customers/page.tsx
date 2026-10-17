import { connection } from "next/server";
import { getCustomers } from "@/lib/queries/customers";
import { CustomersView } from "@/components/customers/customers-view";

type SearchParams = Promise<{
  q?: string;
}>;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await connection();
  const params = await searchParams;
  const customers = await getCustomers({ search: params.q });

  return (
    <CustomersView
      customers={customers}
      searchQuery={params.q}
    />
  );
}
