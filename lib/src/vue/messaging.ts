import type { RemoteConnection } from '../core/types'

/**
 * Module-level remote connection state, set by sprRemote / sprRemoteLegacy.
 */
let _remoteConnection: RemoteConnection | null = null

/** @internal — called by sprRemote / sprRemoteLegacy after core.initRemote() */
export function _setRemoteConnection(conn: RemoteConnection | null): void {
  _remoteConnection = conn
}

/**
 * Send a message to the shell application.
 * Works with both Vue 3 and Vue 2 remotes.
 */
export async function send(payload: unknown): Promise<void> {
  if (!_remoteConnection) {
    console.warn('[@sprlab/microfront] send called before connection was established')
    return
  }
  await _remoteConnection.send(payload)
}

/**
 * Register a handler for messages received from the shell.
 * Can be called multiple times to register multiple handlers.
 */
export function onMessage(handler: (payload: unknown) => void): void {
  if (_remoteConnection) {
    _remoteConnection.onMessage(handler)
  }
}
