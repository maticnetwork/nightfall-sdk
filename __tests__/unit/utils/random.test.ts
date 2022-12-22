import gen from 'general-number';
import { randomL2TokenAddress, randomSalt } from "../../../libs/utils/random";

const { GN } = gen;

describe("Random utils", () => {

  describe("randomL2TokenAddress", () => {

    const isValidL2TokenAddress = (tokenAddress: string) => {
      const binAddress = (new GN(tokenAddress)).binary;
      const isValid = binAddress.charAt(0) === '1' && binAddress.charAt(1) === '1' && Number(binAddress.substring(61,93)) === 0;
      return isValid;
    };
    

    test("Generate 100 addresses and check they are valid", () => {
      for (let i=0; i < 100; i++) {
        randomL2TokenAddress().then( l2Address => {
          expect(isValidL2TokenAddress(l2Address)).toBe(true);
        });
      }
    });
  });

  describe("randomSalt", () => {

    const isValidSalt = (salt: string) => {
      const isValid = BigInt(salt) < BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
      return isValid;
    };

    test("Generate 100 salts and check they are valid", () => {

      for (let i=0; i < 100; i++) {
        randomSalt().then( salt => {
          expect(isValidSalt(salt)).toBe(true);
        });
      }
    });
  });
});