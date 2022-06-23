import convertObjectToString from "../../../libs/utils/convertObjectToString";

describe("Suit fo tests for export commitments use cases", () => {
  const OBJECT = [
    { table: "commitments", rows: [] },
    { table: "transactions", rows: [] },
  ];
  test("should pass an Object and receive a JSON stringfy", async () => {
    const objectStringfy = convertObjectToString(OBJECT);
    expect(objectStringfy).toBe(JSON.stringify(OBJECT));
  });

  test("should pass a paramenter different of an Object and receive an error", async () => {
    expect(() =>
      convertObjectToString("OBJECT" as unknown as object),
    ).toThrowError("The parameter passed is not an object!");
  });
});
