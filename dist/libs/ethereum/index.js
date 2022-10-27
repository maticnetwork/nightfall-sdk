"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEthAccountFromMetaMask = exports.isMetaMaskAvailable = exports.getEthAccountAddress = exports.Web3Websocket = void 0;
const web3Websocket_1 = require("./web3Websocket");
Object.defineProperty(exports, "Web3Websocket", { enumerable: true, get: function () { return web3Websocket_1.Web3Websocket; } });
Object.defineProperty(exports, "isMetaMaskAvailable", { enumerable: true, get: function () { return web3Websocket_1.isMetaMaskAvailable; } });
const accounts_1 = require("./accounts");
Object.defineProperty(exports, "getEthAccountAddress", { enumerable: true, get: function () { return accounts_1.getEthAccountAddress; } });
Object.defineProperty(exports, "getEthAccountFromMetaMask", { enumerable: true, get: function () { return accounts_1.getEthAccountFromMetaMask; } });
//# sourceMappingURL=index.js.map