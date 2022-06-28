import { concatTwoArrays } from "../../../libs/utils/concatTwoArrays";

describe("Suit of tests for concat array", () => {
  const OBJECT1: Array<object> = [
    { table: "commitments", rows: [] },
    { table: "transactions", rows: [] },
  ];
  const OBJECT2: Array<object> = [
    { table: "keys", rows: [] },
    { table: "timber", rows: [] },
  ];
  test("should concat two arrays", async () => {
    const concatedArrays = concatTwoArrays(OBJECT1, OBJECT2);
    expect(concatedArrays).toEqual(OBJECT1.concat(OBJECT2));
  });

  test("should pass a null object and thown an error.", async () => {
    expect(() => {
      concatTwoArrays(null, OBJECT2);
    }).toThrowError("Array can't be null!");
  });
});
