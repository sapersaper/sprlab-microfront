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
        type: () => string[];
        default: () => string[];
    };
    fullHeight: {
        type: BooleanConstructor;
        default: boolean;
    };
}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
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
        type: () => string[];
        default: () => string[];
    };
    fullHeight: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & Readonly<{}>, {
    allowedOrigins: string[];
    timeout: number;
    basePath: string;
    fullHeight: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export default _default;
