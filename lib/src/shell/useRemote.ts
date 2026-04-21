import { provide, inject, ref, computed, type Ref } from 'vue'

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

/**
 * Creates a new messenger instance that manages the penpal connection state,
 * message handlers, and route change handlers.
 */
function createMessenger(): RemoteMessenger {
  const remotePromise: Ref<Promise<unknown> | null> = ref(null)
  const status: Ref<RemoteStatus> = ref(RemoteStatus.Loading)
  const iframeLoaded: Ref<boolean> = ref(false)
  const messageHandlers: MessageHandler[] = []
  const routeChangeHandlers: RouteChangeHandler[] = []

  return {
    status,
    iframeLoaded,
    setIframeLoaded() {
      iframeLoaded.value = true
    },
    setConnection(promise: Promise<unknown>) {
      remotePromise.value = promise
      promise
        .then(() => { status.value = RemoteStatus.Connected })
        .catch(() => {
          // If iframe loaded but penpal didn't connect, the remote is missing the plugin
          status.value = iframeLoaded.value ? RemoteStatus.NoPlugin : RemoteStatus.Error
        })
    },
    async send(payload: unknown) {
      if (!remotePromise.value) {
        console.warn('[@sprlab/microfront] sendMessage called before connection was established')
        return
      }
      const remote = await remotePromise.value as Record<string, (p: unknown) => Promise<void>>
      await remote.onShellMessage(payload)
    },
    handleRemoteMessage(envelope: RemoteMessageEnvelope) {
      messageHandlers.forEach((handler) => handler(envelope.payload, envelope.metadata))
    },
    handleRouteChange(path: string) {
      routeChangeHandlers.forEach((handler) => handler(path))
    },
    onMessage(handler: MessageHandler) {
      messageHandlers.push(handler)
    },
    onRouteChange(handler: RouteChangeHandler) {
      routeChangeHandlers.push(handler)
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
  const messenger = existing ?? createMessenger()

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
