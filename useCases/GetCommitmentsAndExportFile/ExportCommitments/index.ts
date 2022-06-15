import fs from "fs";

const exportCommitments = async (pathFileName: string, content: string) => {
  return fs.writeFileSync(pathFileName, content);
};

const convertObjectToString = (obj: object) => {
  if (typeof obj !== "object") {
    throw new Error("The parameter passed is not an object!");
  }
  return JSON.stringify(obj);
};

export { exportCommitments, convertObjectToString };
