# Nightfall SDK

## About this project

### What is Nightfall SDK?

Software Development Kit for interacting with Polygon Nightfall.

More about [Polygon Nightfall](https://docs.polygon.technology/docs/nightfall/introduction/overview).

### What is the SDK for?

- Deposit ERC20 tokens from Ethereum L1 to Polygon Nightfall L2
- Transfer ERC20 token commitments on Polygon Nightfall L2
- Withdraw ERC20 token commitments from Polygon Nightfall L2 to Ethereum L1
- Check ERC20 balances on Polygon Nightfall L2
- Safely export ERC20 transaction commitments from and to Polygon Nightfall L2

To learn more about transactions, commitments and other core Nightfall features go to the [Protocol Docs](https://docs.polygon.technology/docs/category/nightfall-protocol/).

## Requirements

To use the Nightfall SDK one must be aligned with the following requirements:

### Node

This project uses Node.js 16.15.1. There is an `.nvmrc` file for those using [nvm](https://github.com/nvm-sh/nvm).

### Nightfall Client

#### What is a Nightfall Client?

The Nightfall Client is a key part of the architecture. It is the part which generates zero-knowledge proofs, stores zero-knowledge commitments and interacts with the contracts. The SDK uses Nightfall Client to interact with the Nightfall Protocol. To be able to use the SDK one must have a running instance of the Client.

#### Setup a Client locally (Ganache)

To use the SDK locally, set up and run the entire Nightfall project. The Client is part of this setup and by running the Project you are running the Client too.

You will also need a running proposer, therefore you should use two terminals, one for running Nightfall and one for the Proposer.

##### Setup and run Polygon Nightfall

```bash
git clone https://github.com/EYBlockchain/nightfall_3.git
cd nightfall_3
./setup-nightfall
./start-nightfall -g
```

##### Start the Proposer

```bash
cd nightfall_3/apps/proposer
npm install
npm run start
```

#### Setup a Client in testnet (Goerli)

To use the SDK on a testnet you should only have a running Client, other parts of the infrastructure like the Proposer are provided.

```bash
git clone https://github.com/EYBlockchain/nightfall_3.git
cd nightfall_3/nightfall-client

```

##### Setup

Rename `client-example.env` to `.client.env` and update the contents as following:

```
ETH_NETWORK=goerli
BLOCKCHAIN_URL=your web3 url provider to access the blockchain
```

##### Start client

```bash
./start-client
```

## SDK Setup

Now that you are finished with setting up Nightfall, let’s set up the SDK.

### Clone the repository

```bash
git clone git@github.com:maticnetwork/nightfall-sdk.git
cd nightfall-sdk
```

### Set Node.js version to 16.15.1

```
nvm use
```

### Install requirements

```
npm install
```

### Getting started

To get a good idea of how to interact with Nightfall using the SDK, there are a set of example scripts in `/examples` that allow for a better understanding of the core features of Nightfall.

All of the scripts are explained in short detail below.
You can try them out using the given commands or you can refer to the package.json scripts.
E.g.:

```bash
"eg:deposit:ganache": "ts-node -r dotenv/config examples/txDeposit.ts dotenv_config_path=./examples/.env.ganache dotenv_config_debug=true"
```

#### Environment setup

Being a NPM package, the SDK doesn't use environment variables with exception of the tests and logs. However, you need to pass certain parameters which we recommend to keep private. As such, the example scripts will use a config object that preloads env vars from a file. We suggest to use different files per environments. The deposit script above will look for an /examples/.env.ganache file (based on .env.example).

```
# Contents of .env.ganache
APP_BLOCKCHAIN_WEBSOCKET_URL=ws://localhost:8546
APP_CLIENT_API_URL=http://localhost:8080
# Nightfall_3 User 1
APP_ETH_PRIVATE_KEY=0x4775af73d6dc84a0ae76f8726bda4b9ecf187c377229cb39e1afa7a18236a69e
APP_NIGHTFALL_MNEMONIC=your Nightfall mnemonic
# Nightfall_3 ERC20Mock contract address in ganache
# Make sure to monitor the local deployment and double-check the contract address
APP_TOKEN_ADDRESS_1=0xa8473bEF03cBE50229a39718CBDC1fdee2F26b1a
```

```
# Contents of .env.goerli
APP_BLOCKCHAIN_WEBSOCKET_URL=your web3 socket provider
APP_CLIENT_API_URL=http://localhost:8080
APP_ETH_PRIVATE_KEY=your Ethereum private key
APP_NIGHTFALL_MNEMONIC=your Nightfall mnemonic
# Goerli MATIC
APP_TOKEN_ADDRESS_1=0x499d11E0b6eAC7c0593d8Fb292DCBbF815Fb29Ae
```

### Example scripts

To use the example scripts and the SDK correctly, one needs to have a good understanding of how the Nightfall Protocol runs under the hood.

#### 2Tx rule

**This is a rule that applies to Nightfall Protocol on Ganache.**

Making a deposit, transfer or withdrawal means that a transaction is submitted to L2, when 2 transactions like this are submitted a block is proposed and created. The creation of a new block changes the state of Nightfall. Changing the state of L2 means that the deposit, transfer and withdrawal(not finalise-withdrawal) are finalised.
E.g. Making 1 deposit won't change the state of Nightfall. Running the `eg:balances:ganache` script won't show any updated balance with the new deposit. Making 2 deposits or a deposit and a transfer will update the state and show the correct updated balance when running the script.

#### 32Tx rule

<b>This is a rule that applies to Nightfall Protocol on Goerli Testnet and Mainnet.<b>
To learn more about Nightfall protocol on Mainnet and Testnet visit the [documentation](https://docs.polygon.technology/docs/nightfall/faq/#how-long-do-transfers-take-on-polygon-nightfall-network-from-start-to-finish).

The 32Tx rule is essentually the same as the `2Tx rule` but with 32 transactions instead of 2.

#### Nightfall keys

Upon each running of any of the scripts a new instance of the User class is created, if an existing Mnemonic isn’t specified in the .env file, a new Mnemonic is assigned to that specific user.

#### Available networks

You can run the example scripts on the following networks: `network = ganache`, `network = goerli`

#### Make a deposit

```
npm run-script eg:deposit:[network]
```

#### Make a transfer

For making a transfer an already existing account with ERC20 balance is required. For testing purposes, this can be achieved by saving the mnemonic used for previous deposits and adding it to the .env file.

```
npm run-script eg:transfer:[network]
```

#### Make a withdrawal

For making a withdrawal an already existing account with ERC20 balance is required. For testing purposes, this can be achieved by saving the mnemonic used for previous deposits and adding it to the .env file.

```
npm run-script eg:withdrawal:[network]
```

##### Finalise withdrawal

After initiating a withdrawal you will get a `withdrawTxHash`. To finalise a withdrawal should update `withdrawTxHash` in `/txWithdrawalFinalise.ts`. Then by executing the script below, you will finalise the withdrawal and get the funds back to L1.

```
npm run-script eg:finalise-withdrawal:[network]
```

#### Check L2 balances

Check your L2 balances.

```
npm run-script eg:balances:[network]
```

#### Export commitments

For safety reasons, you can export your commitments and prevent losing them. While you have an exported copy of your Nightfall L2 commitments you can always import them, use them in Nightfall or withdraw them to Ethereum L1.

```
npm run-script eg:export-commitments:[network]
```

## Using the SDK

### Error handling

Today we are handling exceptions and raising these from the SDK using the `NightfallSdkError` class, which is a simple implementation of the Error class. We might improve this in the future, but in the meantime make sure to wrap all SDK calls within a `try/catch` block.

## Need help?

If you have any questions or need some help, join the [Polygon Nightfall discord server](https://discord.com/invite/pZkC3JV2bR).
