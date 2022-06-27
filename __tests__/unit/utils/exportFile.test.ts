import fs from "fs";
import exportFile from "../../../libs/utils/exportFile";

describe("Suit fo tests for export file function", () => {
  const OBJECT = `[
    { table: "commitments", rows: [] },
    { table: "transactions", rows: [] },
  ]`;

  test("should export a file for the path informated", async () => {
    const FILE_PATH = "./__tests__/file.json";
    exportFile(FILE_PATH, OBJECT);
    const data = fs.readFileSync(FILE_PATH);
    console.log("Your file was exported successfully.");
    expect(data.toString("utf8")).toBe(OBJECT);
    fs.unlinkSync(FILE_PATH);
  });
});
