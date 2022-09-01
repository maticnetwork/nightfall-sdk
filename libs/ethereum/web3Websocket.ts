import Web3 from "web3";
import type { WebsocketProvider } from "web3-core";
import type { UserBrowser } from "../user/types";
import type { MetaMaskEthereumProvider } from "./types";
import logger from "../utils/logger";
import {
  WEB3_PROVIDER_OPTIONS,
  TX_TIMEOUT_BLOCKS,
  TX_CONFIRMATION_BLOCKS,
  WS_CONNECTION_PING_TIME_MS,
  WS_BLOCKNO_PING_TIME_MS,
} from "./constants";
import { NightfallSdkError } from "../utils/error";

function isMetaMaskProvider() {
  logger.debug("isMetaMaskProvider");
  const { ethereum } = window as UserBrowser;
  const isMetaMask = ethereum && ethereum.isMetaMask;
  if (!isMetaMask)
    throw new NightfallSdkError("SDK only supports MetaMask, is it installed?");
}

class Web3Websocket {
  // Set by constructor
  provider: MetaMaskEthereumProvider | WebsocketProvider;
  web3: Web3;
  intervalIds: ReturnType<typeof setInterval>[] = [];
  blocknumber: number;

  constructor(wsUrl?: string) {
    logger.debug({ wsUrl }, "new Web3Websocket listening at");

    if (!wsUrl) {
      const { ethereum } = window as UserBrowser;
      this.provider = ethereum;
      this.web3 = new Web3(this.provider);
    } else {
      this.provider = new Web3.providers.WebsocketProvider(
        wsUrl,
        WEB3_PROVIDER_OPTIONS,
      );
      this.web3 = new Web3(this.provider);
    }

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
        if (
          Object.prototype.hasOwnProperty.call(this.provider, "connected") &&
          !this.provider.connected
        ) {
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
    if (Object.prototype.hasOwnProperty.call(this.provider, "disconnect")) {
      (this.provider as WebsocketProvider).disconnect();
    }
  }
}

export { Web3Websocket, isMetaMaskProvider };
