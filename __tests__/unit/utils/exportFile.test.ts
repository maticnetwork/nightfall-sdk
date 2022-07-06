import fs from "fs";
import exportFile from "../../../libs/utils/exportFile";

describe("Suit fo tests for export file function", () => {
  const OBJECT = `[
    { table: "commitments", rows: [] },
    { table: "transactions", rows: [] },
  ]`;

  test("should export a file for the path informated", async () => {
    const FILE_PATH = "./__tests__/file.json";
    // function that will create the file
    exportFile(FILE_PATH, OBJECT);
    const data = fs.readFileSync(FILE_PATH);
    expect(data.toString("utf8")).toBe(OBJECT);
    console.log("Your file was exported successfully.");
    // remove the file created
    fs.unlinkSync(FILE_PATH);
  });
});
