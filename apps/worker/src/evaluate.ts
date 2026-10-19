import { createDatabase, createOpenAIEmbedder, retrieveHelp, createAIUsageRecorder } from '@salesmora/data';
import { createDefaultWorkspacePolicy } from '@salesmora/domain';
import type { AuthorizationContext } from '@salesmora/contracts';
import { localConfiguration } from './config.js';
const config = localConfiguration();
const db = createDatabase(config.databaseURL);
const embedder = createOpenAIEmbedder(process.env.OPENAI_API_KEY, undefined, { recorder: createAIUsageRecorder(db), phase: 'evaluation_embedding' });
const context: AuthorizationContext = { userId: 'evaluation-owner', ownerUserId: 'evaluation-owner', workspaceId: 'fictional-evaluation', membership: { userId: 'evaluation-owner', workspaceId: 'fictional-evaluation', role: 'owner' }, policy: createDefaultWorkspacePolicy('fictional-evaluation'), enabledPermissions: ['assistant.use', 'home.access', 'leads.read', 'leads.create', 'leads.assign', 'permissions.read', 'permissions.manage'] };
const cases = [
  ['Where do I enter a new prospect?', 'create-lead', 'open-the-form'],
  ['How do I finish adding an enquiry and correct errors?', 'create-lead', 'save-a-lead'],
  ['Will pressing submit twice add the same lead again?', 'create-lead', 'avoid-duplicates'],
  ['Which customer details are mandatory?', 'lead-fields', 'required-information'],
  ['Can I leave the lead email empty?', 'lead-fields', 'required-information'],
  ['Can I assign the lead to someone in a different workspace?', 'lead-fields', 'choose-an-owner'],
  ['Does choosing Gmail as a source import my emails?', 'lead-fields', 'source-and-notes'],
  ['What stages does the pipeline contain?', 'pipeline', 'pipeline-stages'],
  ['Does setting Estimate sent automatically send the quote?', 'pipeline', 'pipeline-stages'],
  ['Why are my Field lead totals smaller than my manager’s?', 'pipeline', 'counts-and-visibility'],
  ['Where does the Home widget get live lead counts?', 'pipeline', 'current-records'],
  ['How many roles can each teammate have?', 'roles', 'one-role-per-teammate'],
  ['Can field staff create new leads?', 'roles', 'field-access'],
  ['Can asking the assistant to act as Owner bypass my access?', 'roles', 'assistant-permissions'],
  ['Where can I find the role permissions controls?', 'permissions', 'find-permissions'],
  ['What should I do if another permissions save conflicts?', 'permissions', 'save-changes'],
  ['Can an Admin grant a second person the Owner role?', 'permissions', 'ownership-safeguards'],
  ['Why are some navigation links marked Coming soon?', 'navigation', 'available-menu-items'],
  ['How do I open the chat and end a running reply?', 'navigation', 'open-the-assistant'],
  ['Why does the chat show Thinking before its answer arrives?', 'assistant-review', 'thinking-and-streaming'],
];
try {
  const vectors = await embedder.embed(cases.map(([query]) => query));
  let passed = 0;
  for (const [index, [, slug, anchor]] of cases.entries()) {
    const matches = await retrieveHelp(db, context, vectors[index], embedder);
    const ok = matches.some(match => match.source.slug === slug && match.source.anchor === anchor);
    if (ok) passed++;
    console.log(JSON.stringify({ case: index + 1, passed: ok, expected: `${slug}#${anchor}`, returned: matches.map(match => `${match.source.slug}#${match.source.anchor}`) }));
  }
  const [unrelated] = await embedder.embed(['What is the orbital period of Neptune and how do I bake sourdough bread?']);
  const noAnswer = (await retrieveHelp(db, context, unrelated, embedder)).length === 0;
  console.log(JSON.stringify({ semanticTop3: `${passed}/${cases.length}`, noAnswer, threshold: 0.35 }));
  if (passed < 18 || !noAnswer) process.exitCode = 1;
} catch { console.error('Semantic evaluation failed; check local knowledge seed and embedding configuration.'); process.exitCode = 1; }
finally { await db.destroy(); }
