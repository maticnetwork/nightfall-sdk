"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMetaMaskAvailable = exports.Web3Websocket = void 0;
const web3_1 = __importDefault(require("web3"));
const logger_1 = __importDefault(require("../utils/logger"));
const constants_1 = require("./constants");
const error_1 = require("../utils/error");
function isMetaMaskAvailable() {
    logger_1.default.debug("isMetaMaskAvailable");
    const { ethereum } = window;
    const isMetaMask = ethereum && ethereum.isMetaMask;
    if (!isMetaMask)
        throw new error_1.NightfallSdkError("SDK only supports MetaMask, is it installed?");
}
exports.isMetaMaskAvailable = isMetaMaskAvailable;
class Web3Websocket {
    constructor(wsUrl) {
        this.intervalIds = [];
        logger_1.default.debug({ wsUrl }, "new Web3Websocket listening at");
        if (!wsUrl) {
            logger_1.default.debug("Web3 ws provider to be <MetaMaskEthereumProvider>");
            const { ethereum } = window;
            this.provider = ethereum;
            this.web3 = new web3_1.default(this.provider);
            logger_1.default.info("Web3 ws provider is <MetaMaskEthereumProvider>");
        }
        else {
            logger_1.default.debug("Web3 ws provider to be <WebsocketProvider>");
            this.provider = new web3_1.default.providers.WebsocketProvider(wsUrl, constants_1.WEB3_PROVIDER_OPTIONS);
            this.web3 = new web3_1.default(this.provider);
            logger_1.default.info("Web3 ws provider is <WebsocketProvider>");
        }
        this.setEthConfig();
        this.addWsEventListeners();
        this.checkWsConnection();
        this.refreshWsConnection();
    }
    setEthConfig() {
        logger_1.default.debug("Web3Websocket :: setEthConfig");
        this.web3.eth.transactionBlockTimeout = constants_1.TX_TIMEOUT_BLOCKS;
        this.web3.eth.transactionConfirmationBlocks = constants_1.TX_CONFIRMATION_BLOCKS;
    }
    addWsEventListeners() {
        logger_1.default.debug("Web3Websocket :: addWsEventListeners");
        this.provider.on("connect", () => logger_1.default.info("Blockchain connected"));
        this.provider.on("end", () => logger_1.default.info("Blockchain disconnected"));
        this.provider.on("error", () => logger_1.default.error("Blockchain connection error"));
        this.provider.on("accountsChanged", () => logger_1.default.info("Nightfall SDK detected MetaMask account change"));
    }
    // DOCS Prop `connected` only exists in WebsocketProvider
    // dApps using sdk shouldn't worry about checking ws
    checkWsConnection() {
        logger_1.default.debug("Web3Websocket :: checkWsConnection");
        this.intervalIds.push(setInterval(() => {
            if (Object.keys(this.provider).includes("connected") &&
                !this.provider.connected) {
                logger_1.default.debug("checkWsConnection :: provider includes `connected` false");
                this.updateWeb3Provider();
            }
        }, constants_1.WS_CONNECTION_PING_TIME_MS));
    }
    updateWeb3Provider() {
        logger_1.default.debug("Web3Websocket :: updateWeb3Provider");
        this.web3.setProvider(this.provider);
        logger_1.default.info("Web3 provider updated");
    }
    refreshWsConnection() {
        logger_1.default.debug("Web3Websocket :: refreshWsConnection");
        this.intervalIds.push(setInterval(async () => {
            await this.setEthBlockNo();
        }, constants_1.WS_BLOCKNO_PING_TIME_MS));
    }
    async setEthBlockNo() {
        logger_1.default.debug("Web3Websocket :: setEthBlockNo");
        this.blocknumber = await this.web3.eth.getBlockNumber();
        logger_1.default.info({ blocknumber: this.blocknumber });
        return this.blocknumber;
    }
    close() {
        logger_1.default.debug("Web3Websocket :: close");
        this.clearIntervalIds();
        this.closeWsConnection();
        logger_1.default.info("Web3 connection closed");
    }
    clearIntervalIds() {
        logger_1.default.debug("Web3Websocket :: clearIntervalIds");
        this.intervalIds.forEach((intervalId) => clearInterval(intervalId));
        logger_1.default.debug({ intervalIds: this.intervalIds }, "Cleared intervals");
    }
    // DOCS Method `disconnect` only exists in WebsocketProvider
    // dApps using sdk shouldn't worry about closing ws
    closeWsConnection() {
        logger_1.default.debug("Web3Websocket :: closeWsConnection");
        if ("disconnect" in this.provider) {
            logger_1.default.debug("closeWsConnection :: `disconnect` in provider");
            this.provider.disconnect();
        }
    }
}
exports.Web3Websocket = Web3Websocket;
//# sourceMappingURL=web3Websocket.js.map