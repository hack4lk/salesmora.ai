import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import { GmailFieldMapping, type GmailFieldMappingProps } from './gmail-field-mapping';
import { gmailFieldMappingData as data } from './gmail-field-mapping.data';
import type { GmailMappingTarget } from './gmail-field-mapping.validation';
import type { GmailFinding } from './gmail-field-mapping.findings';
import { GmailEmailExample } from '../gmail-email-example/gmail-email-example';
import { gmailEmailExampleData } from '../gmail-email-example/gmail-email-example.data';
import { gmailFieldSetupProgressData } from '../gmail-field-setup-progress/gmail-field-setup-progress.data';
import { gmailSampleCheckData } from '../gmail-sample-check/gmail-sample-check.data';
import type { GmailCaptureRulesValue } from '../gmail-capture-rules/gmail-capture-rules.validation';
const copy = data.findings;
const sample = { id: 'sample-one', version: 1, subject: data.stories.subject, body: data.stories.body };
const targets: GmailMappingTarget[] = Object.entries(data.stories.targets).filter(([key]) => key !== 'budget').map(([id, label]) => ({ id, label, key: id as GmailMappingTarget['key'], required: id === 'name' || id === 'service' }));
const findings: GmailFinding[] = (['name', 'email', 'service'] as const).map(key => {
  const evidence = sample.body.split('\n').find(line => line.startsWith(`${data.stories.labels[key]}:`))!;
  const text = evidence.slice(evidence.indexOf(':') + 1).trim();
  return { id: key, fieldId: key, included: true, sampleValue: text, suggestedValue: text, confidence: 'found', required: key !== 'email', instruction: `Find ${data.stories.targets[key].toLowerCase()} in the incoming email.`, evidence: { source: 'body', text: evidence } };
});
const value = { sampleId: sample.id, sampleVersion: sample.version, findings };
const rules: GmailCaptureRulesValue = { location: 'both', mode: 'all', phrases: [{ id: 'service', text: gmailSampleCheckData.stories.phrase }, { id: 'contact', text: gmailSampleCheckData.stories.contact }] };
function Preview(args: GmailFieldMappingProps) {
  const [current, setCurrent] = useState(args.value), [fields, setFields] = useState(args.targets), [messages, setMessages] = useState(args.messages), [suggestions, setSuggestions] = useState(args.suggestions);
  const [showExample, setShowExample] = useState(false), [currentSample, setCurrentSample] = useState(args.sample);
  const [example, setExample] = useState({ subject: args.sample?.subject ?? '', body: args.sample?.body ?? '' });
  const host = useRef<HTMLElement>(null), previousScreen = useRef(showExample);
  useEffect(() => {
    if (previousScreen.current !== showExample) {
      const heading = host.current?.querySelector('h2');
      heading?.setAttribute('tabindex', '-1'); heading?.focus();
    }
    previousScreen.current = showExample;
  }, [showExample]);
  const wizard = useRef<{ stage: 'name' | 'meaning' | 'example' | 'required'; name?: string; meaning?: string; example?: string } | null>(null);
  const sequence = useRef(0);
  return <main ref={host} className="min-h-screen bg-canvas p-4 text-ink sm:p-8"><p className="mb-6 mt-0 text-sm text-muted">{data.stories.description}</p>
    {showExample ? <GmailEmailExample value={example} canRead={args.canRead} canEdit={args.canEdit} onChange={setExample} onExtract={async next => {
      // Scripted fixture extraction only; real assistant extraction belongs to the host adapter.
      const nextSample = { ...next, id: currentSample?.id ?? sample.id, version: (currentSample?.version ?? 0) + 1 };
      setCurrentSample(nextSample);
      setCurrent({ sampleId: nextSample.id, sampleVersion: nextSample.version, findings: findings.map(finding => {
        const label = data.stories.labels[finding.fieldId as keyof typeof data.stories.labels];
        const evidence = next.body.split('\n').find(line => line.startsWith(`${label}:`));
        const text = evidence?.slice(evidence.indexOf(':') + 1).trim() ?? '';
        return { ...finding, sampleValue: text, suggestedValue: text, confidence: evidence ? 'found' : 'missing', evidence: evidence ? { source: 'body', text: evidence } : null };
      }) });
      setFields(args.targets); setMessages(args.messages); setSuggestions(args.suggestions); wizard.current = null; setShowExample(false);
    }} /> : <GmailFieldMapping {...args} sample={currentSample} value={current} targets={fields} messages={messages} suggestions={suggestions} onBack={() => { args.onBack(); setShowExample(true); }} onChange={next => { args.onChange(next); setCurrent(next); }} onSend={async (message, snapshot) => {
      await args.onSend(message, snapshot);
      let reply: string = copy.reply;
      if (message === copy.addPrompt) { wizard.current = { stage: 'name' }; reply = copy.askName; }
      else if (wizard.current?.stage === 'name') { wizard.current = { ...wizard.current, stage: 'meaning', name: message }; reply = copy.askMeaning; }
      else if (wizard.current?.stage === 'meaning') { wizard.current = { ...wizard.current, stage: 'example', meaning: message }; reply = copy.askExample; }
      else if (wizard.current?.stage === 'example') { wizard.current = { ...wizard.current, stage: 'required', example: message }; reply = copy.askRequired; setSuggestions([copy.optional, copy.mandatory]); }
      else if (wizard.current?.stage === 'required') {
        if (message !== copy.optional && message !== copy.mandatory) reply = copy.askRequired;
        else {
          const draft = wizard.current, fieldId = `draft-field-${++sequence.current}`;
          setFields(previous => [...previous, { id: fieldId, key: 'custom', label: draft.name! }]);
          setCurrent(previous => ({ ...previous, findings: [...previous.findings, { id: fieldId, fieldId, included: true, sampleValue: draft.example!, suggestedValue: '', confidence: 'missing', required: message === copy.mandatory, instruction: draft.meaning!, evidence: null }] }));
          wizard.current = null; setSuggestions([]); reply = copy.added;
        }
      } else if (message === copy.explainPrompt) reply = copy.explainReply;
      setMessages(previous => [...previous, { id: `user-${++sequence.current}`, role: 'user', text: message }, { id: `assistant-${++sequence.current}`, role: 'assistant', text: reply }]);
    }} />}
  </main>;
}
const meta = {
  title: 'Lead Capture/GmailFieldMapping', component: GmailFieldMapping, parameters: { layout: 'fullscreen' }, render: args => <Preview {...args} />,
  args: { value, targets, sample, rules, messages: [{ id: 'intro', role: 'assistant', text: copy.initial }], suggestions: [], canRead: true, canEdit: true, onBack: fn<GmailFieldMappingProps['onBack']>(), onChange: fn<GmailFieldMappingProps['onChange']>(), onSend: fn<GmailFieldMappingProps['onSend']>(async () => {}), onApprove: fn<GmailFieldMappingProps['onApprove']>(async () => {}) },
} satisfies Meta<typeof GmailFieldMapping>;
export default meta;
type Story = StoryObj<typeof meta>;
const field = (element: HTMLElement, name: string) => within(within(element).getByRole('group', { name }));
async function say(element: HTMLElement, text: string) {
  const c = within(element), input = c.getByRole('textbox', { name: copy.composer });
  await userEvent.type(input, text); await userEvent.click(c.getByRole('button', { name: copy.send }));
  await expect(input).toHaveValue('');
}
export const Default: Story = {};
export const NonMatchingExample: Story = { args: { rules: { ...rules, location: 'subject' } }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await expect(c.getByText(gmailSampleCheckData.noMatch, { exact: true })).toBeVisible();
  await expect(c.getByRole('button', { name: copy.approve })).toBeDisabled();
  await expect(c.getByRole('checkbox', { name: copy.confirm })).toBeDisabled();
  await expect(args.onApprove).not.toHaveBeenCalled();
} };
function ChangedRulesPreview(args: GmailFieldMappingProps) {
  const [currentRules, setRules] = useState(args.rules);
  return <main className="grid min-h-screen gap-6 bg-canvas p-4 text-ink sm:p-8"><button type="button" className="min-h-11 cursor-pointer justify-self-start rounded-xl border border-line bg-paper px-4 text-sm font-semibold text-primary focus-visible:focus-ring" onClick={() => setRules({ ...args.rules, location: 'subject' })}>{gmailSampleCheckData.stories.changeRules}</button><GmailFieldMapping {...args} rules={currentRules} /></main>;
}
export const ChangedRules: Story = { render: args => <ChangedRulesPreview {...args} />, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('checkbox', { name: copy.confirm }));
  await expect(c.getByRole('button', { name: copy.approve })).toBeEnabled();
  await userEvent.click(c.getByRole('button', { name: gmailSampleCheckData.stories.changeRules }));
  await expect(c.getByText(gmailSampleCheckData.noMatch, { exact: true })).toBeVisible();
  await expect(c.getByRole('checkbox', { name: copy.confirm })).not.toBeChecked();
  await expect(c.getByRole('button', { name: copy.approve })).toBeDisabled();
  await expect(args.onApprove).not.toHaveBeenCalled();
} };
export const BackToExample: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('checkbox', { name: copy.confirm }));
  await userEvent.click(c.getByRole('button', { name: gmailFieldSetupProgressData.steps[0] }));
  await expect(args.onBack).toHaveBeenCalledTimes(1);
  await expect(c.getByRole('heading', { name: gmailEmailExampleData.title })).toHaveFocus();
  await expect(c.getByRole('textbox', { name: new RegExp(gmailEmailExampleData.subject) })).toHaveValue(sample.subject);
  const body = c.getByRole('textbox', { name: gmailEmailExampleData.body });
  await expect(body).toHaveValue(sample.body);
  await userEvent.clear(body); await userEvent.type(body, data.stories.updatedBody);
  await userEvent.click(c.getByRole('button', { name: gmailEmailExampleData.extract }));
  await expect(c.getByRole('heading', { name: data.title })).toHaveFocus();
  await expect(field(canvasElement, data.stories.targets.name).getByRole('textbox', { name: copy.value })).toHaveValue('Jamie Morgan');
  await expect(c.getByRole('checkbox', { name: copy.confirm })).not.toBeChecked();
  await expect(args.onApprove).not.toHaveBeenCalled();
} };
export const CorrectExample: Story = { play: async ({ canvasElement, args }) => {
  const row = field(canvasElement, data.stories.targets.name), input = row.getByRole('textbox', { name: copy.value });
  await userEvent.clear(input); await userEvent.type(input, copy.correctedName);
  const saved = args.onChange.mock.calls.at(-1)![0].findings[0];
  await expect(saved.sampleValue).toBe(copy.correctedName);
  await expect(saved.instruction).toBe(findings[0].instruction);
  await expect(row.getByText(copy.edited)).toBeVisible();
} };
export const FutureExtraction: Story = { play: async ({ canvasElement, args }) => {
  const row = field(canvasElement, data.stories.targets.name);
  await userEvent.click(row.getByText(copy.future));
  const instruction = row.getByRole('textbox', { name: copy.instruction });
  await userEvent.clear(instruction); await userEvent.type(instruction, copy.fieldMeaning);
  await expect(args.onChange.mock.calls.at(-1)![0].findings[0].sampleValue).toBe(findings[0].sampleValue);
} };
export const GuidedAddField: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement);
  await userEvent.click(c.getByRole('button', { name: copy.add }));
  await expect(c.getByText(copy.askName)).toBeVisible(); await say(canvasElement, copy.fieldName);
  await expect(c.getByText(copy.askMeaning)).toBeVisible(); await say(canvasElement, copy.fieldMeaning);
  await expect(c.getByText(copy.askExample)).toBeVisible(); await say(canvasElement, copy.fieldExample);
  await expect(c.getByText(copy.askRequired)).toBeVisible(); await userEvent.click(c.getByRole('button', { name: copy.mandatory }));
  const row = field(canvasElement, copy.fieldName);
  await expect(row.getByRole('textbox', { name: copy.value })).toHaveValue(copy.fieldExample);
  await expect(row.getByText(copy.userAdded)).toBeVisible();
  await userEvent.click(row.getByText(copy.future));
  await expect(row.getByRole('checkbox', { name: copy.required })).toBeChecked();
  await expect(args.onApprove).not.toHaveBeenCalled();
} };
export const ExplainConsequences: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.explain }));
  await expect(c.getByText(copy.explainReply)).toBeVisible();
} };
export const Approve: Story = { play: async ({ canvasElement, args }) => {
  const c = within(canvasElement), button = c.getByRole('button', { name: copy.approve });
  await expect(button).toBeDisabled(); await userEvent.click(c.getByRole('checkbox', { name: copy.confirm }));
  await userEvent.click(button);
  await expect(args.onApprove).toHaveBeenCalledWith({ value, targets, sample, rules });
  await expect(await c.findByText(copy.approved)).toBeVisible();
} };
export const EditResetsApproval: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: copy.confirm }));
  await userEvent.type(field(canvasElement, data.stories.targets.name).getByRole('textbox', { name: copy.value }), 'a');
  await expect(c.getByRole('checkbox', { name: copy.confirm })).not.toBeChecked();
  await expect(c.getByRole('button', { name: copy.approve })).toBeDisabled();
} };
export const ApprovalFailure: Story = { args: { onApprove: fn<GmailFieldMappingProps['onApprove']>(async () => { throw new Error('Mock approval failure'); }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('checkbox', { name: copy.confirm })); await userEvent.click(c.getByRole('button', { name: copy.approve }));
  await expect(await c.findByRole('alert')).toHaveTextContent(copy.approveFailure);
} };
export const AssistantFailure: Story = { args: { onSend: fn<GmailFieldMappingProps['onSend']>(async () => { throw new Error('Mock assistant failure'); }) }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await userEvent.type(c.getByRole('textbox', { name: copy.composer }), copy.fieldName); await userEvent.click(c.getByRole('button', { name: copy.send }));
  await expect(await c.findByRole('alert')).toHaveTextContent(copy.sendFailure);
  await expect(c.getByRole('textbox', { name: copy.composer })).toHaveValue(copy.fieldName);
} };
export const Thinking: Story = { args: { onSend: fn<GmailFieldMappingProps['onSend']>(() => new Promise<void>(() => {})) }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await userEvent.click(c.getByRole('button', { name: copy.add }));
  await expect(c.getByRole('status')).toHaveTextContent(copy.thinking);
  await expect(c.getByRole('button', { name: gmailFieldSetupProgressData.steps[0] })).toBeDisabled();
  fireEvent.submit(c.getByRole('textbox', { name: copy.composer }).closest('form')!);
  await expect(args.onSend).toHaveBeenCalledTimes(1);
} };
export const MissingValue: Story = { args: { value: { ...value, findings: findings.map((item, index) => index === 0 ? { ...item, sampleValue: '', suggestedValue: '', confidence: 'missing', evidence: null } : item) } } };
export const Uncertain: Story = { args: { value: { ...value, findings: findings.map((item, index) => index === 0 ? { ...item, confidence: 'uncertain' } : item) } } };
export const ChangedSample: Story = { args: { sample: { ...sample, version: 2 } }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.stale)).toBeVisible(); await expect(c.getByRole('button', { name: copy.approve })).toBeDisabled();
} };
export const ExcludeField: Story = { play: async ({ canvasElement }) => {
  const row = field(canvasElement, data.stories.targets.email); await userEvent.click(row.getByRole('checkbox', { name: copy.include }));
  await expect(row.getByRole('textbox', { name: copy.value })).toBeDisabled();
  await expect(within(canvasElement).getByRole('button', { name: copy.approve })).toBeDisabled();
} };
export const ReadOnly: Story = { args: { canEdit: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); for (const input of c.getAllByRole('textbox')) await expect(input).toBeDisabled();
  await expect(c.queryByRole('button', { name: copy.approve })).not.toBeInTheDocument();
} };
export const PermissionDenied: Story = { args: { canRead: false }, play: async ({ canvasElement }) => {
  const c = within(canvasElement); await expect(c.getByRole('alert')).toHaveTextContent(data.denied); await expect(c.queryByRole('textbox')).not.toBeInTheDocument(); await expect(c.queryByRole('log')).not.toBeInTheDocument();
} };
export const Pending: Story = { args: { pending: true }, play: async ({ canvasElement, args }) => {
  await expect(within(canvasElement).getByRole('button', { name: gmailFieldSetupProgressData.steps[0] })).toBeDisabled();
  await expect(args.onBack).not.toHaveBeenCalled();
} };
export const LongContent: Story = { args: { messages: [{ id: 'long', role: 'assistant', text: copy.initial.repeat(8) }], value: { ...value, findings: findings.map((item, index) => index === 0 ? { ...item, sampleValue: data.stories.long.repeat(2) } : item) } } };
export const Narrow: Story = { globals: { viewport: { value: 'mobile1', isRotated: false } } };

export const UntrustedEmail: Story = { args: {
  sample: { ...sample, body: sample.body.replace('Name: Alex Morgan', 'Name: <img src=x onerror=alert(1)>') },
  value: { ...value, findings: findings.map((item, index) => index === 0 ? { ...item, sampleValue: '<img src=x onerror=alert(1)>', suggestedValue: '<img src=x onerror=alert(1)>', evidence: { source: 'body', text: 'Name: <img src=x onerror=alert(1)>' } } : item) },
}, play: async ({ canvasElement, args }) => {
  await expect(canvasElement.querySelector('img')).toBeNull();
  await expect(field(canvasElement, data.stories.targets.name).getByRole('textbox', { name: copy.value })).toHaveValue('<img src=x onerror=alert(1)>');
  await expect(args.onSend).not.toHaveBeenCalled();
} };

export const PreserveDraft: Story = { play: async ({ canvasElement }) => {
  const c = within(canvasElement), composer = c.getByRole('textbox', { name: copy.composer });
  await userEvent.type(composer, copy.fieldName);
  await userEvent.click(c.getByRole('button', { name: copy.explain }));
  await expect(c.getByText(copy.explainReply)).toBeVisible();
  await expect(composer).toHaveValue(copy.fieldName);
} };

async function checkExampleHelp(canvasElement: HTMLElement, message: string) {
  const canvas = within(canvasElement);
  await expect(canvas.queryByText(message)).not.toBeInTheDocument();
  await userEvent.click(canvas.getByRole('button', { name: data.exampleHelpLabel }));
  const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: data.exampleHelpLabel });
  await expect(within(dialog).getByText(message)).toBeVisible();
}

export const RetrievedExampleProvenance: Story = {
  args: { sample: { ...sample, retrievalId: '00000000-0000-4000-8000-000000000050' } },
  play: ({ canvasElement }) => checkExampleHelp(canvasElement, data.retrievedExample),
};
export const PastedExampleProvenance: Story = {
  play: ({ canvasElement }) => checkExampleHelp(canvasElement, data.pastedExample),
};

export const RestoredApproval: Story = { args: { approvalConfirmed: true }, play: async ({ canvasElement, args }) => {
  const c = within(canvasElement); await expect(c.getByText(copy.approved)).toBeVisible(); await expect(c.getByRole('button', { name: copy.approve })).toBeDisabled(); await expect(args.onApprove).not.toHaveBeenCalled();
} };
