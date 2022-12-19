export const WEB3_PROVIDER_OPTIONS = {
  clientConfig: {
    keepalive: true,
    keepaliveInterval: 10, // ms, docs suggest 60000
  },
  timeout: 3600000, // ms (1h)
  reconnect: {
    auto: false, // if true will always try to reconnect when closing ws connection
    delay: 5000, // ms
    maxAttempts: 120,
    onTimeout: false,
  },
};

// See libs/ethereum/web3Websocket.ts: setEthConfig
export const TX_TIMEOUT_BLOCKS = 2000;
export const TX_CONFIRMATION_BLOCKS = 12;

// See libs/ethereum/web3Websocket.ts: checkWsConnection, getBlockNumber
export const WS_CONNECTION_PING_TIME_MS = 2000;
export const WS_BLOCK_NO_PING_TIME_MS = 15000;

// See libs/ethereum/gas.ts
export const TX_GAS_DEFAULT = 4000000;
export const TX_GAS_MULTIPLIER = 2;
export const GAS_PRICE_ESTIMATE_ENDPOINT =
  "https://vqxy02tr5e.execute-api.us-east-2.amazonaws.com/production/estimateGas";
export const GAS_PRICE = 10000000000;
export const GAS_PRICE_MULTIPLIER = 2;
