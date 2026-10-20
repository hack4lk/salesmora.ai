import { renderCustomersPage } from "../../../../server/customers/read-page";
export default async function CustomerPage({
  searchParams,
  params,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ customerId: string }>;
}) {
  return renderCustomersPage(await searchParams, (await params).customerId);
}
