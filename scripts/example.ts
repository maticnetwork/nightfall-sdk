// npx ts-node src/foo.ts

import User from "../user-client/user";

const ENVIRONMENT = "development";
// const localPrivateKey =
//   "0x4775af73d6dc84a0ae76f8726bda4b9ecf187c377229cb39e1afa7a18236a69e";

// const checkStatus = async () => {
//   await user.checkStatus();
// };
// console.log(await checkStatus());

async function main() {
  const user = new User(ENVIRONMENT);
  const status = await user.checkStatus();
  console.log(status);
}

await main();
console.log("Bye bye");
process.exit();
