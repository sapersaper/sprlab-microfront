import type { Messenger } from './types';
/**
 * Creates a standalone messaging controller (used by Vue's useRemote).
 * Framework-agnostic — uses plain values instead of Vue refs.
 */
export declare function createMessenger(): Messenger;
