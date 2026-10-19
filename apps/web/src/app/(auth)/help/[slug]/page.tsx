import { AuthorizationAccessError } from '@salesmora/data';
import { knowledgeSlugSchema } from '@salesmora/contracts';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '../../../../server/auth/session';
import { currentHelpArticle } from '../../../../server/chat/help';
import { HelpArticle } from '../../../../features/help/help-article/help-article';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'SalesMora help' };
export default async function HelpPage({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ workspace?: string; version?: string }>;
}) {
  const session = await getSession(); if (!session) redirect('/login');
  const { slug } = await params; const { workspace, version } = await searchParams;
  if (!knowledgeSlugSchema.safeParse(slug).success || !workspace || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workspace) || !version || !/^[0-9a-f]{64}$/.test(version)) notFound();
  const article = await currentHelpArticle(session.user.id, workspace, slug, version).catch(error => {
    if (error instanceof AuthorizationAccessError || error.message === 'Help access denied') notFound(); throw error;
  });
  if (!article) notFound();
  return <HelpArticle {...article} workspaceHref={`/home?workspace=${encodeURIComponent(workspace)}`} />;
}
