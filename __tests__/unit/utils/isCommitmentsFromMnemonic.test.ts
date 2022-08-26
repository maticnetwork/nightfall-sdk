import isCommitmentsFromMnemonic from "../../../libs/nightfall/isCommitmentFromMnemonic";
import mockCommitmentsSameCompressedZkpPK from "../../../__mocks__/mockCommitmentsSameCompressedZkpPK";
import mockCompressedZkpPublicKey from "../../../__mocks__/mockCompressedZkpPublicKey";
import mockCommitments from "../../../__mocks__/mockCommitments";

describe("Suit fo tests for isCommitmentsFromMnemonic.test function", () => {
  test("should pass a list of commitments with the same compressedPkd and receive true", async () => {
    const isCommitmentsFromMnemonicReturn = await isCommitmentsFromMnemonic(
      mockCommitmentsSameCompressedZkpPK,
      mockCompressedZkpPublicKey,
    );
    expect(isCommitmentsFromMnemonicReturn).toBeTruthy();
  });

  test("should pass a list of commitments with different compressedPkd and receive an error", async () => {
    expect(() =>
      isCommitmentsFromMnemonic(
        mockCommitments.data.commitmentsByListOfCompressedZkpPublicKey,
        mockCompressedZkpPublicKey,
      ),
    ).rejects.toThrow();
  });
});
