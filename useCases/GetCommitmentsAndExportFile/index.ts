import { concatArrays } from "./ConcatTwoArrays/index";
import {
  convertObjectToString,
  exportCommitments,
} from "./ExportCommitments/index";
import {
  getCommitmentsOffChain,
  getCommitmentsOnChain,
} from "./GetCommitments/index";

const getCommitmentsAndExportFile = async (filePath: string) => {
  const commitmentsOnChain = await getCommitmentsOnChain();
  const commitmentsOffChain = await getCommitmentsOffChain();

  const concatedArrays = concatArrays(commitmentsOnChain, commitmentsOffChain);

  await exportCommitments(filePath, convertObjectToString(concatedArrays));
};

export default getCommitmentsAndExportFile;
