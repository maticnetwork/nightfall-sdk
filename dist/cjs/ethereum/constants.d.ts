export declare const WEB3_PROVIDER_OPTIONS: {
    clientConfig: {
        keepalive: boolean;
        keepaliveInterval: number;
    };
    timeout: number;
    reconnect: {
        auto: boolean;
        delay: number;
        maxAttempts: number;
        onTimeout: boolean;
    };
};
export declare const TX_TIMEOUT_BLOCKS = 2000;
export declare const TX_CONFIRMATION_BLOCKS = 12;
export declare const WS_CONNECTION_PING_TIME_MS = 2000;
export declare const WS_BLOCKNO_PING_TIME_MS = 15000;
