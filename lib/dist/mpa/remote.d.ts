import type { RemoteConnection } from '../core/types';
export interface MpaRemoteOptions {
    /** Identifier sent as metadata with messages to the shell */
    appName?: string;
    /** Allowed origins for postMessage security. Defaults to ['*'] */
    allowedOrigins?: string[];
}
/**
 * Initialize an MPA (Multi-Page App) remote micro frontend.
 * Returns a RemoteConnection with send/onMessage, or null if not in an iframe.
 *
 * This is a standalone bundle that includes penpal — no import map needed.
 *
 * Usage in HTML:
 *   <script type="module">
 *     import { initMpaRemote } from '/dist/mpa-remote.js'
 *     initMpaRemote({ appName: 'my-mpa-app' })
 *   </script>
 */
export declare function initMpaRemote(options?: MpaRemoteOptions): RemoteConnection | null;
export type { RemoteConnection } from '../core/types';
