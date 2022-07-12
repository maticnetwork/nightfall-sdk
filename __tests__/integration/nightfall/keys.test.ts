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
        compressedZkpPublicKey:
          "0x300adad07dedfff59e930711c8ba5324ac7d22a15ea454ebca7eaba0fae7f9a4",
        nullifierKey:
          "0x1ff0e5c9bb59a8e2c2edbcaf9a19bd17721f74998a8c5b4961db8ac4000cb6c6",
        rootKey:
          "0x14837799d8eb23da87c723f6e4f29b7e80dc0cdda8ab45a8430b133cdd997f25",
        zkpPrivateKey:
          "0xd98adbc9dfc82f3e268cc30de5ca172c2c5d9f0ba677d1914fd5244b211a125",
        zkpPublicKey: [
          "0x28ff35250fe2d316277f150b12c08e965e623871c5cc50020993381f9f54d816",
          "0x300adad07dedfff59e930711c8ba5324ac7d22a15ea454ebca7eaba0fae7f9a4",
        ],
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
