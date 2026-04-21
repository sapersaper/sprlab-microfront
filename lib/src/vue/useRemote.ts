import { provide, inject, ref, computed, watch, type Ref } from 'vue'
import { createMessenger } from '../core/messenger'
import type { MessageEnvelope, Messenger, ConnectionStatus } from '../core/types'

const REMOTE_MESSENGER_KEY = Symbol.for('remote-messenger')

type MessageHandler = (payload: unknown, metadata: { appName: string }) => void
type RouteChangeHandler = (path: string) => void

/** Envelope structure for messages sent from remote to shell */
export interface RemoteMessageEnvelope {
  payload: unknown
  metadata: { appName: string }
}

/** Connection status of a remote application */
export enum RemoteStatus {
  /** Iframe is loading and penpal connection is being established */
  Loading = 'loading',
  /** Penpal connection established successfully */
  Connected = 'connected',
  /** Server is unreachable (connection refused or network error) */
  Error = 'error',
  /** Server responds but the @sprlab/microfront plugin is not installed */
  NoPlugin = 'no-plugin',
}

/** Internal messenger interface used for communication between useRemote and RemoteApp */
export interface RemoteMessenger {
  status: Ref<RemoteStatus>
  iframeLoaded: Ref<boolean>
  setConnection: (promise: Promise<unknown>) => void
  setIframeLoaded: () => void
  send: (payload: unknown) => Promise<void>
  handleRemoteMessage: (envelope: RemoteMessageEnvelope) => void
  handleRouteChange: (path: string) => void
  onMessage: (handler: MessageHandler) => void
  onRouteChange: (handler: RouteChangeHandler) => void
}

/** Maps a core ConnectionStatus string to the local RemoteStatus enum */
function toRemoteStatus(coreStatus: ConnectionStatus): RemoteStatus {
  return coreStatus as string as RemoteStatus
}

/**
 * Creates a Vue-reactive messenger that wraps the core Messenger.
 * Uses Vue ref/computed for reactivity while delegating logic to core.
 */
function createVueMessenger(): RemoteMessenger {
  const coreMessenger: Messenger = createMessenger()

  // Vue reactive wrappers around core messenger's plain values
  const status: Ref<RemoteStatus> = ref(toRemoteStatus(coreMessenger.status))
  const iframeLoaded: Ref<boolean> = ref(coreMessenger.iframeLoaded)

  return {
    status,
    iframeLoaded,

    setIframeLoaded() {
      coreMessenger.setIframeLoaded()
      iframeLoaded.value = true
    },

    setConnection(promise: Promise<unknown>) {
      coreMessenger.setConnection(promise)
      // Sync status after the promise resolves/rejects
      promise
        .then(() => { status.value = toRemoteStatus(coreMessenger.status) })
        .catch(() => { status.value = toRemoteStatus(coreMessenger.status) })
    },

    async send(payload: unknown) {
      await coreMessenger.send(payload)
    },

    handleRemoteMessage(envelope: RemoteMessageEnvelope) {
      coreMessenger.handleRemoteMessage(envelope as MessageEnvelope)
    },

    handleRouteChange(path: string) {
      coreMessenger.handleRouteChange(path)
    },

    onMessage(handler: MessageHandler) {
      coreMessenger.onMessage(handler)
    },

    onRouteChange(handler: RouteChangeHandler) {
      coreMessenger.onRouteChange(handler)
    },
  }
}

/**
 * Composable for interacting with a remote application from the shell.
 * Creates or reuses a messenger instance via provide/inject.
 * Must be called in a component that is an ancestor of (or the same as) the RemoteApp component.
 */
export function useRemote() {
  const existing = inject<RemoteMessenger | null>(REMOTE_MESSENGER_KEY, null)
  const messenger = existing ?? createVueMessenger()

  if (!existing) {
    provide(REMOTE_MESSENGER_KEY, messenger)
  }

  return {
    /** Send a message to the remote application */
    sendMessage: messenger.send,
    /** Register a handler for messages received from the remote */
    onMessage: messenger.onMessage,
    /** Register a handler for route changes in the remote */
    onRouteChange: messenger.onRouteChange,
    /** True while the connection is being established */
    isLoading: computed(() => messenger.status.value === RemoteStatus.Loading),
    /** True when the connection is established */
    isConnected: computed(() => messenger.status.value === RemoteStatus.Connected),
    /** True when the remote server is unreachable */
    isError: computed(() => messenger.status.value === RemoteStatus.Error),
    /** True when the server responds but the plugin is missing */
    isNoPlugin: computed(() => messenger.status.value === RemoteStatus.NoPlugin),
  }
}
