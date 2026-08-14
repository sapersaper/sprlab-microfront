import type { MessageHandler, StatusChangeHandler } from '../core/types';
export type RouteChangeHandler = (path: string) => void;
/** Envelope structure for messages sent from remote to shell */
export interface RemoteMessageEnvelope {
    payload: unknown;
    metadata: {
        appName: string;
    };
}
/** Messenger interface exposed to Vue 2 components */
export interface RemoteMessenger {
    /**
     * Current connection status: 'loading' | 'connected' | 'error' | 'no-plugin'.
     * A plain property so Vue 2 can track it — put the messenger in `data()`.
     */
    status: string;
    /** Whether the iframe has loaded (server is reachable). Plain property. */
    iframeLoaded: boolean;
    /** Marks the iframe as loaded */
    setIframeLoaded: () => void;
    /** Sets the penpal connection promise; drives `status` */
    setConnection: (promise: Promise<unknown>) => void;
    /** Sends a message to the remote */
    send: (payload: unknown) => Promise<void>;
    /** Handles an incoming message from the remote */
    handleRemoteMessage: (envelope: RemoteMessageEnvelope) => void;
    /** Handles a route change notification from the remote */
    handleRouteChange: (path: string) => void;
    /** Registers a message handler */
    onMessage: (handler: MessageHandler) => void;
    /** Registers a route change handler */
    onRouteChange: (handler: RouteChangeHandler) => void;
    /** Registers a connection status handler */
    onStatusChange: (handler: StatusChangeHandler) => void;
}
/**
 * Creates a messenger instance for use with Vue 2's provide/inject.
 * Place the result in `data()` of the providing component to get reactivity.
 */
export declare function createRemoteMessenger(): RemoteMessenger;
