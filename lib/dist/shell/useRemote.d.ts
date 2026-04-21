import { type Ref } from 'vue';
type MessageHandler = (payload: unknown, metadata: {
    appName: string;
}) => void;
type RouteChangeHandler = (path: string) => void;
/** Envelope structure for messages sent from remote to shell */
export interface RemoteMessageEnvelope {
    payload: unknown;
    metadata: {
        appName: string;
    };
}
/** Connection status of a remote application */
export declare enum RemoteStatus {
    /** Iframe is loading and penpal connection is being established */
    Loading = "loading",
    /** Penpal connection established successfully */
    Connected = "connected",
    /** Server is unreachable (connection refused or network error) */
    Error = "error",
    /** Server responds but the @sprlab/microfront plugin is not installed */
    NoPlugin = "no-plugin"
}
/** Internal messenger interface used for communication between useRemote and RemoteApp */
export interface RemoteMessenger {
    status: Ref<RemoteStatus>;
    iframeLoaded: Ref<boolean>;
    setConnection: (promise: Promise<unknown>) => void;
    setIframeLoaded: () => void;
    send: (payload: unknown) => Promise<void>;
    handleRemoteMessage: (envelope: RemoteMessageEnvelope) => void;
    handleRouteChange: (path: string) => void;
    onMessage: (handler: MessageHandler) => void;
    onRouteChange: (handler: RouteChangeHandler) => void;
}
/**
 * Composable for interacting with a remote application from the shell.
 * Creates or reuses a messenger instance via provide/inject.
 * Must be called in a component that is an ancestor of (or the same as) the RemoteApp component.
 */
export declare function useRemote(): {
    /** Send a message to the remote application */
    sendMessage: (payload: unknown) => Promise<void>;
    /** Register a handler for messages received from the remote */
    onMessage: (handler: MessageHandler) => void;
    /** Register a handler for route changes in the remote */
    onRouteChange: (handler: RouteChangeHandler) => void;
    /** True while the connection is being established */
    isLoading: import("vue").ComputedRef<boolean>;
    /** True when the connection is established */
    isConnected: import("vue").ComputedRef<boolean>;
    /** True when the remote server is unreachable */
    isError: import("vue").ComputedRef<boolean>;
    /** True when the server responds but the plugin is missing */
    isNoPlugin: import("vue").ComputedRef<boolean>;
};
export {};
