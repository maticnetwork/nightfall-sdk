[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Nightfall SDK

## What is Nightfall SDK?

Software Development Kit for interacting with Polygon Nightfall.

You can clone the repo and [play with the example scripts](#play-with-the-sdk-repository), or you can [install it as a dependency](#install-sdk-from-npm) from NPM.

More about [Polygon Nightfall](https://docs.polygon.technology/docs/nightfall/introduction/overview).

### What is the SDK for?

- Deposit ERC20 tokens from Ethereum L1 to Polygon Nightfall L2
- Transfer ERC20 token commitments on Polygon Nightfall L2
- Withdraw ERC20 token commitments from Polygon Nightfall L2 to Ethereum L1
- Check ERC20 balances on Polygon Nightfall L2
- Safely export/import ERC20 transaction commitments from and to Polygon Nightfall L2

To learn more about transactions, commitments and other core Nightfall features go to the [Protocol Docs](https://docs.polygon.technology/docs/category/nightfall-protocol/).

## What is a Nightfall Client?

The Nightfall Client is a key part of the architecture. It generates zero-knowledge proofs, stores zero-knowledge commitments and interacts with the contracts. The SDK uses Nightfall Client to interact with the Nightfall Protocol.

**To be able to use the SDK one must have a running instance of the Client**.

### Setup a Client locally (Ganache)

To use the SDK locally, set up and run the entire Nightfall project. The Client is part of this setup and by running the Project you are running the Client too.

You will also need a running proposer, therefore you should use two terminals, one for running Nightfall and one for the Proposer.

**Setup and run Polygon Nightfall**

```bash
git clone https://github.com/EYBlockchain/nightfall_3.git
cd nightfall_3
./setup-nightfall
./start-nightfall -g -d
```

**Run the Proposer**

```bash
# terminal 2, also cd into nightfall_3
./start-apps
```

### Setup a Client in testnet (Goerli)

To use the SDK on a testnet you should only have a Client running, other parts of the infrastructure like the Proposer are provided.

```bash
git clone https://github.com/EYBlockchain/nightfall_3.git
cd nightfall_3/nightfall-client
```

**Setup Client**

Rename `client-example.env` to `.client.env` and update the contents as following:

```
ETH_NETWORK=goerli
BLOCKCHAIN_URL=your web3 url provider to access the blockchain
```

**Run Client**

```bash
./start-client
```

## Install SDK from NPM

Add the Nightfall SDK as a dependency to your project:

```bash
npm install nightfall-sdk
```

To use the SDK, import `UserFactory`. This will generate an instance of `User` that you should use to perform all the available operations. E.g.

```bash
import { UserFactory } from 'nightfall-sdk';

user = await UserFactory.create(userOptions);
const txReceipts = await user.makeDeposit(depositOptions);
```

*Where userOptions is of type UserFactoryCreate and depositOptions UserMakeDeposit*.

Check out the [example scripts](#example-scripts) for a better understanding on how to use the SDK to its capacity. You can also dee-dive into the code and inspect the [User library](https://github.com/maticnetwork/nightfall-sdk/tree/master/libs/user) (see `user.ts` for more details about each method).

## Play with the SDK repository

You can clone the repository and run the examples available. Note that it requires Node 16.

```bash
git clone git@github.com:maticnetwork/nightfall-sdk.git
cd nightfall-sdk
nvm use && npm install
```

### Getting started

To get a good idea of how to interact with Nightfall using the SDK, there is a set of example scripts in `/examples/scripts` to showcase the core features of Nightfall.

All of the scripts are explained in short detail below.
You can try them out by using the given commands. You can also refer to the package.json scripts.
E.g.:

```bash
"eg:ganache:deposit": "ts-node -r dotenv/config examples/scripts/txDeposit.ts dotenv_config_path=./examples/scripts/.env.ganache dotenv_config_debug=true"
```

**To use the example scripts and the SDK correctly, one needs to have a good understanding of how the Nightfall Protocol runs under the hood**.

#### Environment setup

Being a NPM package, the SDK doesn't use environment variables with the exception of tests and logs. However, you need to pass certain parameters which we recommend to keep private.

As such, the example scripts will use a config object that preloads env vars from a file. We suggest to use different files per environments. The deposit script above will look for an /examples/scripts/.env.ganache file (based on .env.example).

```
# Contents of .env.ganache (based on .env.example)
APP_BLOCKCHAIN_WEBSOCKET_URL=ws://localhost:8546
APP_CLIENT_API_URL=http://localhost:8080

# Nightfall_3 User 1
APP_ETH_PRIVATE_KEY=0x4775af73d6dc84a0ae76f8726bda4b9ecf187c377229cb39e1afa7a18236a69e
APP_NIGHTFALL_MNEMONIC=your Nightfall mnemonic

# Nightfall_3 ERC20Mock contract address in ganache
# Monitor the local deployment and double-check the contract address below
APP_TOKEN_ADDRESS_1=0xa8473bEF03cBE50229a39718CBDC1fdee2F26b1a
```

#### Available networks

Polygon Nightfall has been thoroughly tested on `ganache` and `goerli`. On Goerli we provide most of the infrastructure required to run Nightfall, except for the client. 

#### 2Tx rule

**Applies to Nightfall Protocol on Ganache**

Making a deposit, transfer or withdrawal means that a transaction is submitted to L2, when 2 transactions like this are submitted a block is proposed and created. The creation of a new block changes the state of Nightfall. Changing the state of L2 means that the deposit, transfer and withdrawal (not finalise-withdrawal) are finalised.

E.g. Making 1 deposit won't change the state of Nightfall. Running the `eg:ganache:balances` script won't show any updated balance with the new deposit. Making 2 deposits or a deposit and a transfer will update the state and show the correct updated balance when running the script.

#### 32Tx rule

**Applies to Nightfall Protocol on Goerli Testnet**

The 32Tx rule is essentially the same as the `2Tx rule` but with 32 transactions instead of 2.

To learn more about Nightfall protocol visit the [documentation](https://docs.polygon.technology/docs/nightfall/faq/#how-long-do-transfers-take-on-polygon-nightfall-network-from-start-to-finish).

#### Nightfall keys

Upon each running of any of the scripts a new instance of the `User` class is created.

If you don't provide a mnemonic via `env` file, a new mnemonic is assigned. This can be convenient to play with deposits, but it also means you generate a new "wallet" on Nightfall every time.

**Make sure to grab your mnemonic and update the environment variable to access your funds on Nightfall**.

```js
const mnemonic = user.getNightfallMnemonic()
```

### Example scripts

**Before running the scripts below, we strongly recommend reading the [Getting started](#getting-started) section**.

#### Make a deposit

Your balance on Nightfall will update as soon your funds settle, i.e. soon as there are enough [transactions to create an L2 block](#2tx-rule). 

```
npm run-script eg:[network]:deposit
```

#### Make a transfer

For making a transfer an already existing account in L2 with balance is required. This can be achieved by saving the mnemonic used for previous deposits and adding it to the .env file.

```
npm run-script eg:[network]:transfer
```

#### Make a withdrawal

For making a withdrawal an already existing account in L2 with balance is required. This can be achieved by saving the mnemonic used for previous deposits and adding it to the .env file.

```
npm run-script eg:[network]:withdrawal
```

#### Finalise withdrawal

After initiating a withdrawal you will get a `withdrawTxHashL2`. To finalise a withdrawal you should update `withdrawTxHashL2` in `txWithdrawalFinalise.ts`. Run the script after the cooling off period to get the funds back to L1.

```
npm run-script eg:[network]:finalise-withdrawal
```

#### Check L2 balances

Check your balances in Nightfall.

```
npm run-script eg:[network]:balances
```

#### Export commitments

For safety reasons, you can export your commitments and prevent losing them. While you have an exported copy of your Nightfall L2 commitments you can always import them to use them in Nightfall or withdraw them to Ethereum L1.

```
npm run-script eg:[network]:export-commitments
```

#### Import commitments

The import commitment functionality provides a safe import of already exported Nightfall commitments. Note that the commitments are being exported in a file and the same file should be used for importing them. To make sure that the commitments are being imported successfully run `eg:[network]:balances` a check the updated balance.

```
npm run-script eg:[network]:import-commitments
```

## Using the SDK

### Error handling

Today we are handling errors using the `NightfallSdkError` class, which is a simple implementation of the Error class. We might improve this in the future, but in the meantime make sure to wrap all SDK calls within a `try/catch` block.

## Need help?

If you have any questions or need some help, join the [Polygon Nightfall discord server](https://discord.com/invite/pZkC3JV2bR).
