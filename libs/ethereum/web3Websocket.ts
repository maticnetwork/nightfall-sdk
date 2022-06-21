import Web3 from "web3";
import { WebsocketProvider } from "web3-core";
import logger from "../utils/logger";

const WEB3_PROVIDER_OPTIONS = {
  clientConfig: {
    keepalive: true,
    keepaliveInterval: 10, // ms, docs suggest 60000
  },
  timeout: 3600000, // ms (1h)
  reconnect: {
    auto: false, // with true is always trying to reconnect and the connection is never closed
    delay: 5000, // ms
    maxAttempts: 120,
    onTimeout: false,
  },
};

// See setEthConfig
const TX_TIMEOUT_BLOCKS = 2000;
const TX_CONFIRMATION_BLOCKS = 12;

// See checkWsConnection, getBlockNumber
const WS_CONNECTION_PING_TIME_MS = 2000;
const WS_BLOCKNO_PING_TIME_MS = 15000;

class Web3Websocket {
  // Set by constructor
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

    this.setEthConfig();
    this.addWsEventListeners();
    this.checkWsConnection();
    this.refreshWsConnection();
  }

  setEthConfig() {
    logger.debug("Web3Websocket :: setEthConfig");
    this.web3.eth.transactionBlockTimeout = TX_TIMEOUT_BLOCKS;
    this.web3.eth.transactionConfirmationBlocks = TX_CONFIRMATION_BLOCKS;
  }

  addWsEventListeners() {
    logger.debug("Web3Websocket :: addWsEventListeners");
    this.provider.on("connect", () => logger.info("Blockchain connected"));
    this.provider.on("end", () => logger.info("Blockchain disconnected"));
    this.provider.on("error", () =>
      logger.error("Blockchain connection error"),
    );
  }

  checkWsConnection() {
    logger.debug("Web3Websocket :: checkWsConnection");
    this.intervalIds.push(
      setInterval(() => {
        if (!this.provider.connected) {
          this.updateWeb3Provider();
        }
      }, WS_CONNECTION_PING_TIME_MS),
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
      }, WS_BLOCKNO_PING_TIME_MS),
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
    this.provider.disconnect();
  }
}

export default Web3Websocket;
