import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ChatProposalFamily } from '@salesmora/contracts';
import type { RuntimeMessage } from '@salesmora/agent';

vi.mock('server-only', () => ({}));
import { testDraftModel } from './test-provider';

const fixtures: { message: string; family: ChatProposalFamily; state: 'pending' | 'confirmed'; answer: string }[] = [
  { message: 'fixture:estimate-void-history', family: 'estimateVoid', state: 'confirmed', answer: 'Verified confirmed withdrawal.' },
  { message: 'fixture:estimate-archive-history', family: 'estimateArchive', state: 'confirmed', answer: 'Verified confirmed Archive/Restore.' },
  { message: 'fixture:estimate-draft-delete-history', family: 'estimateDraftDelete', state: 'confirmed', answer: 'Verified confirmed Draft deletion.' },
  { message: 'fixture:estimate-convert-history', family: 'estimateConversion', state: 'pending', answer: 'Verified pending conversion proposal' },
  { message: 'fixture:estimate-draft-action-history', family: 'estimateDraftAction', state: 'confirmed', answer: 'Verified confirmed Draft operation.' },
  { message: 'fixture:estimate-decision-history', family: 'estimateDecision', state: 'confirmed', answer: 'Verified recorded decision receipt.' },
];

afterEach(() => vi.unstubAllEnvs());

describe('proposal history fixture provider', () => {
  it.each(fixtures)('checks the recorded family and state for $family', async fixture => {
    vi.stubEnv('SALESMORA_TEST_SERVER', '1');
    vi.stubEnv('CHAT_TEST_PROVIDER', 'fixture');
    vi.stubEnv('DATABASE_URL', 'postgres://localhost/fictional_test');
    const model = testDraftModel(fixture.message);
    if (!model) throw new Error('Missing fixture model.');
    const answer = async (messages: RuntimeMessage[]) => {
      let text = '';
      for await (const part of model.answer(messages, [], new AbortController().signal)) text += part;
      return text;
    };
    const recorded = (family: ChatProposalFamily, state: string): RuntimeMessage => ({
      role: 'assistant',
      text: `App-recorded historical proposal states (fixture): ${JSON.stringify([{ family, state }])}\nFictional answer.`,
    });
    expect(await answer([recorded(fixture.family, fixture.state)])).toContain(fixture.answer);
    expect(await answer([recorded(fixture.family, fixture.state === 'pending' ? 'confirmed' : 'pending')]))
      .not.toContain(fixture.answer);
    expect(await answer([recorded(fixture.family === 'action' ? 'customer' : 'action', fixture.state)]))
      .not.toContain(fixture.answer);
    expect(await answer([{ role: 'assistant', text: JSON.stringify({ family: fixture.family, state: fixture.state }) }]))
      .not.toContain(fixture.answer);
  });
});
