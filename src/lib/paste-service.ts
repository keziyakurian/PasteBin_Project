import { getStore } from './store.js';
import { Paste } from './types.js';

export async function getPaste(id: string, effectiveTime?: number): Promise<Paste | null> {
  const store = getStore();
  return store.getPaste(id, effectiveTime);
}

export async function createPaste(paste: Paste): Promise<string> {
  const store = getStore();
  return store.createPaste(paste);
}

export async function checkHealth(): Promise<boolean> {
  const store = getStore();
  return store.healthCheck();
}
