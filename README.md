# Nightfall SDK

## About this project

### What is Nightfall SDK?

Software Development Kit for interacting with Polygon Nightfall.
About [Polygon Nightfall](https://docs.polygon-nightfall.technology/).

### What is the SDK for?

- Deposit ERC20 tokens from Ethereum L1 to Polygon Nightfall L2
- Transfer ERC20 token commitments on Polygon Nightfall L2
- Withdraw ERC20 token commitments from Polygon Nightfall L2 to Ethereum L1
- Check ERC20 balances on Polygon Nightfall L2
- Safely export and import ERC20 transaction commitments from and to Polygon Nightfall L2
- All the above applicable for ERC721 and ERC1155 token standards - WIP

## Requirements

To use the Nightfall SDK you would have to be aligned with the following requirements:

### Node

This project uses Node.js 16.15.1. There is an `.nvmrc` file for those using [nvm](https://github.com/nvm-sh/nvm).

### Nightfall client

#### What is a Nightfall Client?

A Nightfall Client is a key part of the Nightfall architecture. The SDK uses Nightfall Client to interact with Layer 2.
To interact with the Nightfall SDK you will need to run an instance of a Nightfall Client.

#### Setup a client

##### Locally (Ganache)

    To use the SDK locally, set up and run the entire Nightfall project.

##### Setup and run Polygon Nightfall

```bash
git clone https://github.com/EYBlockchain/nightfall_3.git
cd nightfall_3
./setup-nightfall
./start-nightfall -g
```

###### Start the Proposer

```bash
cd nightfall_3/apps/proposer
npm install
npm run start
```

#### Goerli Testnet

To use the SDK on a testnet, run the following commands

```
git clone https://github.com/EYBlockchain/nightfall_3.git
```

##### Setup `.client.env`

```
ETH_NETWORK=goerli
BLOCKCHAIN_URL={}
```

##### Start client

```
cd nightfall_3/nightfall-client
./start-client
```

#### EthereumMainnet

Nightfall SDK on a mainnet you will need a running client

```
git clone https://github.com/EYBlockchain/nightfall_3.git
cd nightfall_3/nightfall-client
```

##### Setup `.client.env`

```
ETH_NETWORK=mainnet
BLOCKCHAIN_URL=your web3 url provider to access the blockchain
```

##### Start client

```
./start-client
```

### SDK Setup

Now that you are finished with setting up Nightfall, let’s setup the SDK

Clone the repo:

```
git clone git@github.com:maticnetwork/nightfall-sdk.git
cd nightfall-sdk
```

Set Node.js version to 16.15.1:

```
nvm use
```

Install requirements:

```
npm install
```

#### Setup environments

Being a NPM package, the SDK itself doesn’t use environment variables with exception of the tests. But in order to use the SDK you will need to set up an environment file following a specific .env.example file.
Env.example

##### Locally (Ganache)

Create .env.ganache file

```
APP_BLOCKCHAIN_WEBSOCKET_URL=ws://localhost:8546
APP_CLIENT_API_URL=http://localhost:8080
APP_ETH_PRIVATE_KEY=0x4775af73d6dc84a0ae76f8726bda4b9ecf187c377229cb39e1afa7a18236a69e
APP_NIGHTFALL_MNEMONIC=
APP_TOKEN_ADDRESS_1=0x4f3c4F8D4575Cf73c2FAf9F36cc505e19E65B9C0
```

##### Goerli Testnet

Create .env.goerli file

```
APP_BLOCKCHAIN_WEBSOCKET_URL=wss://goerli.infura.io/ws/v3/89114afb34fb4dc29d333f9849679c53
APP_CLIENT_API_URL=http://localhost:8080
APP_ETH_PRIVATE_KEY=
APP_NIGHTFALL_MNEMONIC=
APP_TOKEN_ADDRESS_1=0x499d11E0b6eAC7c0593d8Fb292DCBbF815Fb29Ae
```

##### EthereumMainnet

### Getting started

To get a good idea of how to interact with Nightfall using the SDK, there are a set of example scripts that allow for a better understanding of the core features of Nightfall.

All of the scripts are explained in short detail below and are to be run in a local environment.

\*Note
The scripts load an .env file, it is suggested to use different files per environment, for example creating `examples/.env.ganache` for a local environment, based on `.env.example`.
Upon each running of any of the scripts a new instance of the User class is created, if an existing Mnemonic isn’t specified in the `.env` file, a new Mnemonic is assigned to that specific user.

#### Make a deposit

```
npm run-script eg:deposit:ganache
```

#### Make a transfer

For creating a transfer an already existing account with deposit is required. For testing purposes, this can be achieved by saving the mnemonic used for previous deposits and adding it to the .env file. Two deposits are needed to be able to make a transfer.

```
npm run-script eg:transfer:ganache
```

#### Make a withdrawal

To be able to withdraw a balance in Nightfall is needed, this means that at least two deposits are to be made for the proposer to make a block and settle these deposits.

```
npm run-script eg:withdrawal:ganache
```

#### Finalise withdrawal

After initiating a withdrawal, two transactions need to be made in order for the proposer to create a block. Upon creating a withdrawal request, finalising the withdrawal means getting the funds back to L1

```
npm run-script eg:finalise-withdrawal:ganache
```

#### Check L2 balances

```
npm run-script eg:nf-balances:ganache
```

#### Export commitments

```
npm run-script eg:export-commitments:ganache
```

#### Import commitments

```
npm run-script eg:nf-balances
```

### Eth testing account and tokens

TBC

### Need help?

If you have any questions or need some help, join the [Polygon Nightfall discord server](https://discord.com/invite/pZkC3JV2bR).
