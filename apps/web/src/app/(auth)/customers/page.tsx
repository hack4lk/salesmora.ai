import { renderCustomersPage } from "../../../server/customers/read-page";
export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderCustomersPage(await searchParams);
}
