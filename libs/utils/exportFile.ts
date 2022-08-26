import fs from "fs";

/**
 *
 * @function exportFile export a string content received to the pathFileName defined.
 * @param pathFileName an string with the path + file name.
 * @param content the content to be wrote in the file.
 */
const exportFile = async (pathFileName: string, content: string) => {
  fs.writeFileSync(pathFileName, content);
};

export default exportFile;
