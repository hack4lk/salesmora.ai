/** Internal server adapter contract. Never include prompts or provider payloads. */
export interface AITokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedInputTokens: number;
  reasoningTokens: number;
}
export type AIUsagePhase = 'planning' | 'answer' | 'query_embedding' | 'corpus_embedding' | 'evaluation_embedding';
export interface AIUsageResult {
  outcome: 'completed' | 'failed' | 'cancelled';
  tokens?: AITokenUsage;
}
/** Start must persist before provider work; finish records unknown usage as null. */
export interface AIUsageRecorder {
  requiresReservation?: boolean;
  start(model: string, phase: AIUsagePhase, reservationTokens?: number): Promise<(result: AIUsageResult) => Promise<void>>;
}
export class AIBudgetExceededError extends Error {
  constructor() { super('Workspace AI allowance unavailable'); this.name = 'AIBudgetExceededError'; }
}
/** SDK transport errors may wrap a budget denial as their cause. */
export function aiBudgetError(error: unknown): AIBudgetExceededError | undefined {
  let current = error;
  for (let depth = 0; depth < 8 && current instanceof Error; depth++) {
    if (current instanceof AIBudgetExceededError) return current;
    current = current.cause;
  }
}
export function validAITokenUsage(value: AITokenUsage): boolean {
  return Object.values(value).every(n => Number.isSafeInteger(n) && n >= 0) &&
    value.inputTokens + value.outputTokens === value.totalTokens &&
    value.cachedInputTokens <= value.inputTokens && value.reasoningTokens <= value.outputTokens;
}
