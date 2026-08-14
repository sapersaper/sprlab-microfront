declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    src: {
        type: StringConstructor;
        required: true;
    };
    title: {
        type: StringConstructor;
        required: true;
    };
    basePath: {
        type: StringConstructor;
        default: string;
    };
    timeout: {
        type: NumberConstructor;
        default: number;
    };
    allowedOrigins: {
        type: ArrayConstructor;
        default: () => string[];
    };
    fullHeight: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, {}, {
    initialSrc: string;
    remoteHeight: number;
    connectionStatus: string;
    statusTracked: boolean;
}, {
    iframeStyle(): {
        width: string;
        border: string;
    };
    isVisible(): boolean;
    /**
     * Path the remote should be on, derived from the shell route.
     * Vue Router 3 exposes catch-all segments as `params.pathMatch`;
     * `params.path` is supported too for hand-written routes.
     */
    remotePath(): string;
}, {
    createConnection(): any;
    /** Remote → shell: mirror the remote's route onto the shell URL */
    applyRemoteRoute(path: any): void;
    /** Shell → remote: tell the remote to navigate, falling back to a src change for MPAs */
    syncRemoteToShellRoute(newPath: any): Promise<void>;
    /** Joins basePath with a remote path, avoiding a trailing slash for the root */
    shellPathFor(path: any): string;
    /**
     * Ask the remote for its effective height given the container height.
     * Forces the iframe to container height, waits for layout, then measures.
     */
    requestRemoteHeight(): Promise<void>;
    checkServerReachable(url: any): Promise<boolean>;
    trackConnectionStatus(): Promise<void>;
}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    src: {
        type: StringConstructor;
        required: true;
    };
    title: {
        type: StringConstructor;
        required: true;
    };
    basePath: {
        type: StringConstructor;
        default: string;
    };
    timeout: {
        type: NumberConstructor;
        default: number;
    };
    allowedOrigins: {
        type: ArrayConstructor;
        default: () => string[];
    };
    fullHeight: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    allowedOrigins: unknown[];
    timeout: number;
    basePath: string;
    fullHeight: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
