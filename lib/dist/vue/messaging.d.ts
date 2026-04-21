import type { RemoteConnection } from '../core/types';
/** @internal — called by sprRemote / sprRemoteLegacy after core.initRemote() */
export declare function _setRemoteConnection(conn: RemoteConnection | null): void;
/**
 * Send a message to the shell application.
 * Works with both Vue 3 and Vue 2 remotes.
 */
export declare function send(payload: unknown): Promise<void>;
/**
 * Register a handler for messages received from the shell.
 * Can be called multiple times to register multiple handlers.
 */
export declare function onMessage(handler: (payload: unknown) => void): void;
