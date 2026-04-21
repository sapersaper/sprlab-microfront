import type { ShellConnectionOptions, RemoteInitOptions, PenpalHandle, RemoteConnection } from './types';
/**
 * Establishes a shell-side penpal connection to an iframe.
 * Returns { promise, destroy } — same shape as penpal's connect().
 */
export declare function connectToRemote(options: ShellConnectionOptions): PenpalHandle;
/**
 * Initializes the remote side: penpal connection, height observer,
 * history patch, and optional route sync via RouterAdapter.
 * Returns a RemoteConnection with send/onMessage and the connection promise.
 * Returns null if not inside an iframe.
 */
export declare function initRemote(options: RemoteInitOptions): RemoteConnection | null;
