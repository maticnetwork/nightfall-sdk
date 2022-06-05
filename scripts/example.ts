// npx ts-node scripts/example.ts

import User from "../src/user-client/user";

const ENVIRONMENT = "development";
// const localPrivateKey =
//   "0x4775af73d6dc84a0ae76f8726bda4b9ecf187c377229cb39e1afa7a18236a69e";

const main = async () => {
  try {
    const user = new User(ENVIRONMENT);
    const status = await user.checkStatus();
    console.log(status);
    console.log("Bye bye");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

main();
