import mockCommitments from "../../../__mocks__/mockCommitments";
import convertObjectToString from "../../../libs/utils/convertObjectToString";

describe("Suit of tests for convert object in string function", () => {
  const commitments: Array<object> =
    mockCommitments.data.allCommitmentsByCompressedPkd;

  test("should pass an Object and receive a JSON stringfy", async () => {
    const objectStringfy = convertObjectToString(commitments);
    expect(objectStringfy).toBe(JSON.stringify(commitments));
  });

  test("should pass a paramenter different of an Object and receive an error", async () => {
    expect(() =>
      convertObjectToString("commitments" as unknown as object),
    ).toThrowError("The parameter passed is not an object!");
  });
});
