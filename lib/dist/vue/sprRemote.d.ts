export interface SprRemoteOptions {
    /** Identifier sent as metadata with messages to the shell */
    appName?: string;
    /** Vue Router instance for automatic route synchronization with the shell */
    router?: any;
    /** Allowed origins for postMessage security. Defaults to ['*'] */
    allowedOrigins?: string[];
}
/**
 * Vue 3 plugin for remote micro frontend connection.
 * Delegates all core logic to core.initRemote().
 *
 * Usage: app.use(sprRemote, { appName: 'my-app', router })
 */
export declare const sprRemote: {
    install(app: any, options?: SprRemoteOptions): void;
};
