import { expect, userEvent, waitFor, within } from 'storybook/test';

export async function selectMetricEvidence(canvasElement: HTMLElement, label: string) {
  const c = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  await userEvent.click(c.getByRole('button', { name: `Actions: ${label}` }));
  const item = await body.findByRole('menuitem', { name: 'View supporting evidence' });
  await waitFor(() => expect(item).toBeVisible());
  await userEvent.click(item);
  await waitFor(() => expect(body.queryByRole('menuitem', { name: 'View supporting evidence' })).not.toBeInTheDocument());
}
