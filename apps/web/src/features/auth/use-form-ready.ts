'use client';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const ready = () => true;
const serverReady = () => false;

/** Keep client-only forms inert until their submit handlers are hydrated. */
export function useFormReady() {
  return useSyncExternalStore(subscribe, ready, serverReady);
}
