[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Nightfall SDK

## What is Nightfall SDK?

Software Development Kit for interacting with Polygon Nightfall.

You can clone the repo and [play with the example scripts](#play-with-the-sdk-repository), or you can [install it as a dependency](https://wiki.polygon.technology/docs/nightfall/tools/user-sdk-getting-started) from NPM.

More about [Polygon Nightfall](https://docs.polygon.technology/docs/nightfall/introduction/overview).

### What is the SDK for?

- Deposit ERC20,ERC721 and ERC1155 tokens from Ethereum L1 to Polygon Nightfall L2
- Transfer ERC20,ERC721 and ERC1155 token commitments on Polygon Nightfall L2
- Withdraw ERC20,ERC721 and ERC1155 token commitments from Polygon Nightfall L2 to Ethereum L1
- Check ERC20,ERC721 and ERC1155 balances on Polygon Nightfall L2
- Safely export/import ERC20,ERC721 and ERC1155 transaction commitments from and to Polygon Nightfall L2

To learn more about transactions, commitments and other core Nightfall features go to the [Protocol Docs](https://docs.polygon.technology/docs/category/nightfall-protocol/).

## What is a Nightfall Client?

To use the SDK you need to have a Nightfall Client running.

Check out the [documentation](https://docs.polygon.technology/docs/nightfall/tools/user-sdk-api/) to learn about what is it and how to set it up.

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
APP_TOKEN_ADDRESS=0xa8473bEF03cBE50229a39718CBDC1fdee2F26b1a
```

#### Available networks

Polygon Nightfall has been thoroughly tested on `ganache` and `goerli`. On Goerli we provide most of the infrastructure required to run Nightfall, except for the client.
Simple but important rules about [transaction processing](https://wiki.polygon.technology/docs/nightfall/tools/user-sdk-getting-started#available-networks).

#### Nightfall keys

Upon each running of any of the scripts a new instance of the `User` class is created.

If you don't provide a mnemonic via `env` file, a new mnemonic is assigned. This can be convenient to play with deposits, but it also means you generate a new "wallet" on Nightfall every time.

**Make sure to grab your mnemonic and update the environment variable to access your funds on Nightfall**.

```js
const mnemonic = user.getNightfallMnemonic();
```

### Example scripts

**Before running the scripts below, we strongly recommend reading the [Getting started](https://wiki.polygon.technology/docs/nightfall/tools/user-sdk-getting-started) section**.

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

### Web App

The Web Application is an example of how to use functionalities that SDK provides to interact with Nightfall via MetaMask.
Learn more about it in the [docs](https://wiki.polygon.technology/docs/nightfall/tools/user-sdk-demo-app).

#### Start the app:

Open the repository, navigate to the web-app and install the dependencies

```
cd examples/web-app
npm install
```

Navigate to the root directory and run the following script. The app is running on port 4000.

```
cd ../../
npm run eg:react-web-app-start
```

Note that the app is working on Ganache so your MetaMask provider will have to be connected to Localhost with the following parameters.
Import new network to MetaMask

|                 |                       |
| --------------- | --------------------- |
| Network name    | localhost             |
| RPC URL         | http://localhost:8546 |
| Chain ID        | 1337                  |
| Currency symbol | Test                  |

Once you are on the correct network, import a ganache account with Test token to be able to execute transactions.

You can use the ganache account with a private key stated in the .env config above.

### Error handling

Check the [documentation](https://wiki.polygon.technology/docs/nightfall/tools/user-sdk-api#error-handling) to learn about error handling.

## Need help?

If you have any questions or need some help, join the [Polygon Nightfall discord server](https://discord.com/invite/pZkC3JV2bR).
