import { concatArrays } from "../../../../useCases/GetCommitmentsAndExportFile/ConcatTwoArrays";

describe("Suit of tests for concat array", () => {
  const OBJECT1 = [
    { table: "commitments", rows: [] },
    { table: "transactions", rows: [] },
  ];
  const OBJECT2 = [
    { table: "keys", rows: [] },
    { table: "timber", rows: [] },
  ];
  test("should concat two arrays", async () => {
    const concatedArrays = concatArrays(OBJECT1, OBJECT2);
    expect(concatedArrays).toEqual(OBJECT1.concat(OBJECT2));
  });
});
