import { setupPageData as copy } from './page.data';

export default function SetupPage() {
  return (
    <main className="p-6">
      <h1 className="mb-4 text-3xl font-semibold">{copy.title}</h1>
      <p className="mb-2">{copy.description}</p>
      <p>{copy.instructions}</p>
    </main>
  );
}
