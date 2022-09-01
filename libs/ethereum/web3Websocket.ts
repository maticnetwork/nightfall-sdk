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

function isMetaMaskAvailable() {
  logger.debug("isMetaMaskAvailable");
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
      logger.debug("Web3 ws provider to be <MetaMaskEthereumProvider>");
      const { ethereum } = window as UserBrowser;
      this.provider = ethereum;
      this.web3 = new Web3(this.provider);
      logger.info("Web3 ws provider is <MetaMaskEthereumProvider>");
    } else {
      logger.debug("Web3 ws provider to be <WebsocketProvider>");
      this.provider = new Web3.providers.WebsocketProvider(
        wsUrl,
        WEB3_PROVIDER_OPTIONS,
      );
      this.web3 = new Web3(this.provider);
      logger.info("Web3 ws provider is <WebsocketProvider>");
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

  // DOCS Prop `connected` only exists in WebsocketProvider
  // dApps using sdk shouldn't worry about checking ws
  checkWsConnection() {
    logger.debug("Web3Websocket :: checkWsConnection");
    this.intervalIds.push(
      setInterval(() => {
        if (
          Object.keys(this.provider).includes("connected") &&
          !this.provider.connected
        ) {
          logger.debug(
            "checkWsConnection :: provider includes `connected` false",
          );
          this.updateWeb3Provider();
        }
      }, WS_CONNECTION_PING_TIME_MS),
    );
  }

  updateWeb3Provider() {
    logger.debug("Web3Websocket :: updateWeb3Provider");
    this.web3.setProvider(this.provider);
    logger.info("Web3 provider updated");
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
    logger.info("Web3 connection closed");
  }

  clearIntervalIds() {
    logger.debug("Web3Websocket :: clearIntervalIds");
    this.intervalIds.forEach((intervalId) => clearInterval(intervalId));
    logger.debug({ intervalIds: this.intervalIds }, "Cleared intervals");
  }

  // DOCS Method `disconnect` only exists in WebsocketProvider
  // dApps using sdk shouldn't worry about closing ws
  closeWsConnection() {
    logger.debug("Web3Websocket :: closeWsConnection");

    if ("disconnect" in this.provider) {
      logger.debug("closeWsConnection :: `disconnect` in provider");
      (this.provider as WebsocketProvider).disconnect();
    }
  }
}

export { Web3Websocket, isMetaMaskAvailable };
