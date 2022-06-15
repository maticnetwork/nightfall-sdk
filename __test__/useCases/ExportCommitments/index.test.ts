import {
  convertObjectToString,
  exportCommitments,
} from "../../../useCases/ExportCommitments";
import fs from "fs";

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

  test("should export a file for the path informated", async () => {
    const FILE_PATH = "./__test__/file.json";
    exportCommitments(FILE_PATH, convertObjectToString(OBJECT));
    const data = fs.readFileSync(FILE_PATH);
    console.log("Your file was exported successfully.");
    expect(data.toString("utf8")).toBe(JSON.stringify(OBJECT));
    fs.unlinkSync(FILE_PATH);
  });
});
