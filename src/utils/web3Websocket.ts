import Web3 from "web3";
import { WebsocketProvider } from "web3-core";
import logger from "./logger";

// TODO consider rm constants from this file
// TODO review WEB3_PROVIDER_OPTIONS
const WEB3_PROVIDER_OPTIONS = {
  clientConfig: {
    keepalive: true,
    keepaliveInterval: 10,
  },
  timeout: 3600000, // 1h in ms
  reconnect: {
    auto: true,
    delay: 5000, // ms
    maxAttempts: 120,
    onTimeout: false,
  },
};

// FYI see setEthConfig
const TX_BLOCK_TIMEOUT = 2000;
const TX_BLOCK_CONFIRMATION_COUNT = 12;

// FYI see checkWsConnection, getBlockNumber
const WS_CONNECTION_PING_TIME = 2000;
const WS_BLOCK_NO_PING_TIME = 15000;

class Web3Websocket {
  wsUrl: string;
  provider: WebsocketProvider;
  web3: Web3;
  intervalIds: ReturnType<typeof setInterval>[] = [];
  blocknumber: number;

  constructor(wsUrl: string) {
    logger.debug({ wsUrl }, "new Web3Websocket listening at");
    this.wsUrl = wsUrl;
    this.provider = new Web3.providers.WebsocketProvider(
      wsUrl,
      WEB3_PROVIDER_OPTIONS,
    );
    this.web3 = new Web3(this.provider);

    this.init();
  }

  init() {
    this.setEthConfig();
    this.addWsEventListeners();
    this.checkWsConnection(); // TODO review checkWsConnection + refreshWsConnection "dance"
    this.refreshWsConnection();
  }

  setEthConfig() {
    logger.debug("Web3Websocket :: setEthConfig");
    this.web3.eth.transactionBlockTimeout = TX_BLOCK_TIMEOUT;
    this.web3.eth.transactionConfirmationBlocks = TX_BLOCK_CONFIRMATION_COUNT;
  }

  addWsEventListeners() {
    logger.debug("Web3Websocket :: addWsEventListeners");
    this.provider.on("connect", () => console.info("Blockchain connected")); // FYI callback used to capture err
    this.provider.on("end", () => console.info("Blockchain disconnected"));
    this.provider.on("error", () =>
      console.error("Blockchain connection error"),
    );
  }

  checkWsConnection() {
    logger.debug("Web3Websocket :: checkWsConnection");
    this.intervalIds.push(
      setInterval(() => {
        if (!this.provider.connected) {
          // TODO review, condition was this.web3.currentProvider.connected (FYI provider same as web3.currentProvider)
          this.updateWeb3Provider();
        }
      }, WS_CONNECTION_PING_TIME),
    );
  }

  updateWeb3Provider() {
    logger.debug("Web3Websocket :: updateWeb3Provider");
    this.web3.setProvider(this.provider);
  }

  refreshWsConnection() {
    logger.debug("Web3Websocket :: refreshWsConnection");
    this.intervalIds.push(
      setInterval(async () => {
        await this.setEthBlockNo();
      }, WS_BLOCK_NO_PING_TIME),
    );
  }

  async setEthBlockNo(): Promise<number> {
    logger.debug("Web3Websocket :: setEthBlockNo");
    this.blocknumber = await this.web3.eth.getBlockNumber();
    logger.info({ blocknumber: this.blocknumber });
    return this.blocknumber;
  }

  close() {
    logger.debug("Web3Websocket :: close");
    this.clearIntervalIds();
    this.closeWsConnection();
  }

  clearIntervalIds() {
    logger.debug("Web3Websocket :: clearIntervalIds");
    this.intervalIds.forEach((intervalId) => clearInterval(intervalId));
    logger.info({ intervalIds: this.intervalIds }, "Cleared intervals");
  }

  closeWsConnection() {
    logger.debug("Web3Websocket :: closeWsConnection");
    // this.web3.currentProvider.disconnect(); // TODO review, was connection.close()
  }
}

export default Web3Websocket;
