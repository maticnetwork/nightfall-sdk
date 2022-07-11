import { Client } from "../../../libs/client";
import { createZkpKeysAndSubscribeToIncomingKeys } from "../../../libs/nightfall";
import * as dotenv from "dotenv";
import path from "path";

const rootPath = path.resolve();
dotenv.config({ path: path.join(rootPath, ".env") });

const CLIENT_API_URL = process.env.SDK_CLIENT_API_URL;

describe("Create Zero-knowledge proof keys and subscribe to incoming keys", () => {
  let mnemonic: undefined | string;
  const client = new Client(CLIENT_API_URL);

  test("Should return a set of NightfallKeys for mnemonic undefined", async () => {
    const result = await createZkpKeysAndSubscribeToIncomingKeys(
      mnemonic,
      client,
    );
    expect(result).toHaveProperty("nightfallMnemonic");
    expect(result).toHaveProperty("zkpKeys");
  });

  test("Should return a set of NightfallKeys for valid mnemonic", async () => {
    mnemonic =
      "notable soul hair frost pave now coach what income brush wet make";
    const result = await createZkpKeysAndSubscribeToIncomingKeys(
      mnemonic,
      client,
    );

    const knownNightfallKeys = {
      nightfallMnemonic: mnemonic,
      zkpKeys: {
        ask: "0x14837799d8eb23da87c723f6e4f29b7e80dc0cdda8ab45a8430b133cdd997f25",
        nsk: "0x225647796f7294cfef66c65bbabaf0b975d8b285fa23c161c25205370ef870b",
        ivk: "0x2d7248800b1b39c0a8163a23ca854f11cfdfa10c369b945d24b2145339212d26",
        pkd: [
          "0x19d3001a494d5a46d7ac4a10e4aef6481728bbc6ba1b0338ff075e038aab55ba",
          "0x2d7beff14d72a14bfb8a3cd1b7c3ed694bf4ecb1eb34e2c538f82ae20e96d18c",
        ],
        compressedPkd:
          "0x2d7beff14d72a14bfb8a3cd1b7c3ed694bf4ecb1eb34e2c538f82ae20e96d18c",
      },
    };
    expect(result).toStrictEqual(knownNightfallKeys);
  });

  test("Should return null for invalid mnemonic", async () => {
    mnemonic = "pepe";
    const result = await createZkpKeysAndSubscribeToIncomingKeys(
      mnemonic,
      client,
    );
    expect(result).toBeNull();
  });
});
