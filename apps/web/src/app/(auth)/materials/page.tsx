import { renderMaterialsPage } from '../../../server/materials/read-page';

export default async function MaterialsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return renderMaterialsPage(await searchParams);
}
