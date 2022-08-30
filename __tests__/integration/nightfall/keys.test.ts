import { Client } from "../../../libs/client";
import { createZkpKeysAndSubscribeToIncomingKeys } from "../../../libs/nightfall";

const CLIENT_API_URL = process.env.APP_CLIENT_API_URL;

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
      "chef fortune soon coral laugh distance arrest summer lottery rival quarter oyster";
    const result = await createZkpKeysAndSubscribeToIncomingKeys(
      mnemonic,
      client,
    );

    const knownNightfallKeys = {
      nightfallMnemonic: mnemonic,
      zkpKeys: {
        compressedZkpPublicKey:
          "0x00781eab9bd94da3eb84c7a1b085f162f5eb58f9c189efef788a5176982a07e1",
        nullifierKey:
          "0x1ec80c50b816fff74890a5d08bc95c1c749d955201b8a9ada0f99a117b8ccc8a",
        rootKey:
          "0x2366fc5530da8bc6618f01b2ac8fee17489cdef28ee8c21a0b945ba883d0da7c",
        zkpPrivateKey:
          "0xd9f1e813a2c10559620ad3fba2050c13898d1250776f27b9e7f35de5f973788",
        zkpPublicKey: [
          "0x39cf22690edcc4d25eb1121a8d583e566b03463ef2defc8703670878ddca0ce",
          "0x781eab9bd94da3eb84c7a1b085f162f5eb58f9c189efef788a5176982a07e1",
        ],
      },
    };
    expect(result).toStrictEqual(knownNightfallKeys);
  });

  test("Should fail if a Nightfall error is thrown", () => {
    mnemonic = "pepe";
    expect(
      async () =>
        await createZkpKeysAndSubscribeToIncomingKeys(mnemonic, client),
    ).rejects.toThrow();
  });
});
