import fs from "fs";

const exportFile = async (pathFileName: string, content: string) => {
  fs.writeFileSync(pathFileName, content);
};

export default exportFile;
