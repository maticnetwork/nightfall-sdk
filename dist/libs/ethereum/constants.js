"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WS_BLOCKNO_PING_TIME_MS = exports.WS_CONNECTION_PING_TIME_MS = exports.TX_CONFIRMATION_BLOCKS = exports.TX_TIMEOUT_BLOCKS = exports.WEB3_PROVIDER_OPTIONS = void 0;
exports.WEB3_PROVIDER_OPTIONS = {
    clientConfig: {
        keepalive: true,
        keepaliveInterval: 10, // ms, docs suggest 60000
    },
    timeout: 3600000,
    reconnect: {
        auto: false,
        delay: 5000,
        maxAttempts: 120,
        onTimeout: false,
    },
};
// See libs/ethereum/web3Websocket.ts: setEthConfig
exports.TX_TIMEOUT_BLOCKS = 2000;
exports.TX_CONFIRMATION_BLOCKS = 12;
// See libs/ethereum/web3Websocket.ts: checkWsConnection, getBlockNumber
exports.WS_CONNECTION_PING_TIME_MS = 2000;
exports.WS_BLOCKNO_PING_TIME_MS = 15000;
//# sourceMappingURL=constants.js.map