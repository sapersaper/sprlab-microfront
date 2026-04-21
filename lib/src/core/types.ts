/**
 * Shared types, interfaces, and enums for the framework-agnostic core module.
 */

/** Status of a remote connection */
export enum ConnectionStatus {
  /** Iframe is loading and penpal connection is being established */
  Loading = 'loading',
  /** Penpal connection established successfully */
  Connected = 'connected',
  /** Server is unreachable (connection refused or network error) */
  Error = 'error',
  /** Server responds but the @sprlab/microfront plugin is not installed */
  NoPlugin = 'no-plugin',
}

/** Envelope for messages from remote → shell */
export interface MessageEnvelope {
  payload: unknown
  metadata: { appName: string }
}

export type MessageHandler = (payload: unknown, metadata: { appName: string }) => void
export type RouteChangeHandler = (path: string) => void

/** Framework-neutral router adapter for route synchronization */
export interface RouterAdapter {
  /** Returns the current route path */
  getCurrentPath(): string
  /** Replaces the current route (no new history entry) */
  replace(path: string): void
  /** Registers a callback invoked after each navigation */
  afterEach(callback: (path: string) => void): void
}

/** Options for shell-side penpal connection */
export interface ShellConnectionOptions {
  iframe: HTMLIFrameElement
  allowedOrigins: string[]
  timeout: number
  methods: Record<string, (...args: unknown[]) => unknown>
}

/** Options for remote-side initialization */
export interface RemoteInitOptions {
  appName?: string
  allowedOrigins?: string[]
  router?: RouterAdapter
  methods?: Record<string, (...args: unknown[]) => unknown>
}

/** Handle returned by connectToRemote */
export interface PenpalHandle {
  promise: Promise<unknown>
  destroy: () => void
}

/** State object returned by initRemote */
export interface RemoteConnection {
  connectionPromise: Promise<unknown>
  send: (payload: unknown) => Promise<void>
  onMessage: (handler: (payload: unknown) => void) => void
}

/** Internal messenger used by shell-side wrappers */
export interface Messenger {
  status: ConnectionStatus
  iframeLoaded: boolean
  setConnection(promise: Promise<unknown>): void
  setIframeLoaded(): void
  send(payload: unknown): Promise<void>
  handleRemoteMessage(envelope: MessageEnvelope): void
  handleRouteChange(path: string): void
  onMessage(handler: MessageHandler): void
  onRouteChange(handler: RouteChangeHandler): void
}
