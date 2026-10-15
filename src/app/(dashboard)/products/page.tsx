import { getProducts } from "@/lib/queries/products";
import { ProductsView } from "@/components/products/products-view";

// Next.js 15/16 — searchParams is a Promise
type SearchParams = Promise<{
  q?: string;
  type?: string;
  active?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const products = await getProducts({
    search: params.q,
    type: params.type,
    active: params.active,
  });

  return (
    <ProductsView
      products={products}
      searchQuery={params.q}
      typeFilter={params.type}
      activeFilter={params.active}
    />
  );
}
