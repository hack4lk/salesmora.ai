import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isImplementedTool, toolRegistry } from '@salesmora/agent';
import type { ChatToolRequestContext } from './types';
const mocks = vi.hoisted(() => ({ run: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('./runner', () => ({ executeChatTool: mocks.run }));
import { createChatToolExecutor } from './index';

const request: ChatToolRequestContext = {
  identity: { userId: 'fictional-owner', workspaceId: '00000000-0000-4000-8000-000000000001' },
  turnId: '00000000-0000-4000-8000-000000000002', sessionId: 'trusted-session',
  surface: 'home', pageContext: {}, signal: new AbortController().signal,
};
beforeEach(() => { vi.clearAllMocks(); });
describe('one exhaustive server tool registry', () => {
  it.each(Object.keys(toolRegistry))('routes %s through the shared runner', async name => {
    if (!isImplementedTool(name)) throw new Error('Invalid registry fixture.');
    const args = { fixture: true }, result = { evidence: {} };
    mocks.run.mockResolvedValue(result);
    expect(await createChatToolExecutor(request)(name, args)).toBe(result);
    expect(mocks.run).toHaveBeenCalledExactlyOnceWith(request, name, args,
      expect.objectContaining(name === 'search_help' ? { prepare: expect.any(Function) } : { execute: expect.any(Function) }));
  });
  it.each(['constructor', '__proto__', 'unregistered_tool'])('rejects %s without execution', async name => {
    await expect(createChatToolExecutor(request)(name, {})).rejects.toThrow('Unavailable tool');
    expect(mocks.run).not.toHaveBeenCalled();
  });
  it('does not expose handler-owned authority acquisition or root DB handles', () => {
    const base = new URL('./', import.meta.url);
    const names = readdirSync(base).filter(name => name.endsWith('.ts') && !name.endsWith('.test.ts'));
    for (const relative of [...names, '../customers.ts', '../materials-actions.ts', '../work-orders-actions.ts']) {
      const path = fileURLToPath(new URL(relative, base)), source = readFileSync(path, 'utf8');
      const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
      const check = (node: ts.Node) => {
        if (ts.isVariableDeclaration(node) && node.type?.getText(file) === 'ChatToolHandler' && node.initializer) {
          expect(node.initializer.getText(file), relative).not.toMatch(
            /\b(?:database|authorizedWorkspace|withWorkspaceAuthorization)\s*\(|context\.authorize(?:Turn)?\s*\(/,
          );
        }
        ts.forEachChild(node, check);
      };
      check(file);
    }
    const leads = new URL('../leads/', base);
    for (const name of readdirSync(leads).filter(name => name.endsWith('.ts') && !name.endsWith('.test.ts'))) {
      expect(readFileSync(new URL(name, leads), 'utf8'), name).not.toMatch(
        /\b(?:database|authorizedWorkspace|withWorkspaceAuthorization)\s*\(|context\.authorize(?:Turn)?\s*\(/,
      );
    }
  });
});
