import { getStore } from './store';
import { Paste } from './types';

export async function getPaste(id: string): Promise<Paste | null> {
  const store = getStore();
  return store.getPaste(id);
}

export async function createPaste(paste: Paste): Promise<string> {
  const store = getStore();
  return store.createPaste(paste);
}

export async function checkHealth(): Promise<boolean> {
  const store = getStore();
  return store.healthCheck();
}
