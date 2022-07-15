import isCommitmentsFromMnemonic from "../../../libs/utils/isCommitmentsFromMnemonic";
import mockCommitmentsSameCompressedZkpPK from "../../../__mocks__/mockCommitmentsSameCompressedZkpPK";
import mockCompressedZkpPublicKey from "../../../__mocks__/mockCompressedZkpPublicKey";
import mockCommitments from "../../../__mocks__/mockCommitments";
mockCommitments;
describe("Suit fo tests for isCommitmentsFromMnemonic.test function", () => {
  test("should pass a list of commitments with the same compressedPkd and receive true", async () => {
    const isCommitmentsFromMnemonicReturn = await isCommitmentsFromMnemonic(
      mockCommitmentsSameCompressedZkpPK,
      mockCompressedZkpPublicKey,
    );
    expect(isCommitmentsFromMnemonicReturn).toBeTruthy();
  });

  test("should pass a list of commitments with different compressedPkd and receive false", async () => {
    const isCommitmentsFromMnemonicReturn = await isCommitmentsFromMnemonic(
      mockCommitments.data.allCommitmentsByListOfCompressedZkpPublicKey,
      mockCompressedZkpPublicKey,
    );
    expect(isCommitmentsFromMnemonicReturn).toBeFalsy();
  });
});
