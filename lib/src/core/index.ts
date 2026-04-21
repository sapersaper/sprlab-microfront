// Types, interfaces, and enums
export {
  ConnectionStatus,
  type MessageEnvelope,
  type MessageHandler,
  type RouteChangeHandler,
  type RouterAdapter,
  type ShellConnectionOptions,
  type RemoteInitOptions,
  type PenpalHandle,
  type RemoteConnection,
  type Messenger,
} from './types'

// Utility functions
export { isInsideIframe } from './iframe'
export { patchHistoryPushState } from './history'
export { observeContentHeight } from './height'

// Messenger
export { createMessenger } from './messenger'

// Connection management
export { connectToRemote, initRemote } from './connection'
