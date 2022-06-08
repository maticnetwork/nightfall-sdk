// npx ts-node scripts/example.ts

import User from "../src/entities/user";

const ENVIRONMENT = "development";
const localPrivateKey =
  "0x4775af73d6dc84a0ae76f8726bda4b9ecf187c377229cb39e1afa7a18236a69e";

// Prepend `0x`
// const goerliPrivateKey =
//   "0xdfa0f64681e33a5682900779c1155b1b1eed82fdd12302a70cfbaa2926734361";

const main = async () => {
  try {
    const user = new User(ENVIRONMENT);
    const status = await user.checkStatus();
    console.log(status);
    const init = await user.configUser({
      ethereumPrivateKey: localPrivateKey,
      tokenName: "erc20mock",
    });
    console.log(init);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

main();
