import { registerPlugin } from '@capacitor/core';

import type { CapacitorNativeFilesPlugin } from './definitions';

const CapacitorNativeFiles = registerPlugin<CapacitorNativeFilesPlugin>('CapacitorNativeFiles', {
  web: () => import('./web').then((m) => new m.CapacitorNativeFilesWeb()),
});

export * from './definitions';
export { CapacitorNativeFiles };
