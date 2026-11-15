import 'server-only';
import { AsyncLocalStorage } from 'node:async_hooks';
import { subscribeChatCancellation, withDatabasePhase } from '@salesmora/data';
import { turnStillActive, type ChatIdentity } from './store';

/** Notifications wake a check; the persisted turn state remains authoritative. */
export function watchChatTurnCancellation(
  identity: ChatIdentity,
  turnId: string,
  abort: AbortController,
) {
  let stopped = false;
  let checking = false;
  let recheck = false;
  let pendingCheck: Promise<void> = Promise.resolve();
  const checkActive = AsyncLocalStorage.bind(() => {
    if (stopped || abort.signal.aborted) return;
    if (checking) {
      recheck = true;
      return;
    }
    checking = true;
    pendingCheck = withDatabasePhase('cancellation', async () => {
      do {
        recheck = false;
        if (!(await turnStillActive(identity, turnId)) && !abort.signal.aborted)
          abort.abort('cancelled');
      } while (recheck && !stopped && !abort.signal.aborted);
    }).catch(() => {
      console.error('chat_cancellation_status_check_failed');
      if (!abort.signal.aborted) abort.abort('unavailable');
    }).finally(() => { checking = false; });
  });
  const subscription = withDatabasePhase('cancellation', () =>
    subscribeChatCancellation(turnId, checkActive, () => {
      if (!stopped && !abort.signal.aborted) abort.abort('unavailable');
    }));
  const ready = subscription.ready.then(async available => {
    if (stopped || abort.signal.aborted) return;
    if (!available) {
      console.error('chat_cancellation_listener_unavailable');
      abort.abort('unavailable');
      return;
    }
    checkActive();
    await pendingCheck;
  });
  return {
    ready,
    stop() {
      stopped = true;
      subscription.unsubscribe();
      return ready.then(() => pendingCheck);
    },
  };
}
