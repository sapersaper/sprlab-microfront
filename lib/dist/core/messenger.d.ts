import type { Messenger } from './types';
/**
 * Creates a standalone messaging controller used by the framework wrappers.
 * Framework-agnostic — plain values instead of Vue refs.
 *
 * `status` lives in a closure, so subscribe with `onStatusChange` to observe it.
 * That is the single place where the status rule is defined; wrappers mirror it
 * into their own reactivity system rather than re-deriving it.
 */
export declare function createMessenger(): Messenger;
