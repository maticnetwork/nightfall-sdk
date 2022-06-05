import Web3 from "web3";
import { WebsocketProvider } from "web3-core";

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
  intervalIds: NodeJS.Timer[] = []; // FYI https://github.com/Chatie/eslint-config/issues/45 - eslint-disable-next-line no-undef
  blocknumber: number;

  constructor(wsUrl: string) {
    this.wsUrl = wsUrl;

    this.provider = new Web3.providers.WebsocketProvider(
      wsUrl,
      WEB3_PROVIDER_OPTIONS
    );
    this.web3 = new Web3(this.provider);
    this.setEthConfig();
    this.addWsEventListeners();
    this.checkWsConnection(); // TODO review checkWsConnection + refreshWsConnection "dance"
    this.refreshWsConnection();
  }

  setEthConfig() {
    this.web3.eth.transactionBlockTimeout = TX_BLOCK_TIMEOUT;
    this.web3.eth.transactionConfirmationBlocks = TX_BLOCK_CONFIRMATION_COUNT;
  }

  addWsEventListeners() {
    this.provider.on("connect", () => console.info("Blockchain connected")); // FYI callback used to capture err
    this.provider.on("end", () => console.info("Blockchain disconnected"));
    this.provider.on("error", () =>
      console.error("Blockchain connection error")
    );
  }

  async setEthBlockNo(): Promise<number> {
    this.blocknumber = await this.web3.eth.getBlockNumber();
    return this.blocknumber;
  }

  refreshWsConnection() {
    this.intervalIds.push(
      setInterval(async () => {
        await this.setEthBlockNo();
      }, WS_BLOCK_NO_PING_TIME)
    );
  }

  checkWsConnection() {
    this.intervalIds.push(
      setInterval(() => {
        if (!this.provider.connected) this.web3.setProvider(this.provider); // TODO review, was this.web3.currentProvider.connected
      }, WS_CONNECTION_PING_TIME)
    );
  }

  clearIntervalIds() {
    this.intervalIds.forEach((intervalId) => clearInterval(intervalId));
  }

  closeWsConnection() {
    this.web3.currentProvider.disconnect(); // TODO review, was connection.close()
  }

  close() {
    this.clearIntervalIds();
    this.closeWsConnection();
  }
}

export default Web3Websocket;
