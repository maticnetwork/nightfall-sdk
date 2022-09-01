import { commitmentsFromMnemonic } from "../../../libs/nightfall";
import mockCommitmentsSameCompressedZkpPK from "../../../__mocks__/mockCommitmentsSameCompressedZkpPK";
import mockCompressedZkpPublicKey from "../../../__mocks__/mockCompressedZkpPublicKey";
import mockCommitments from "../../../__mocks__/mockCommitments";

describe("Suit fo tests for commitmentsFromMnemonic.test function", () => {
  test("should pass a list of commitments with the same compressedPkd and receive true", async () => {
    const commitmentsFromMnemonicReturn = await commitmentsFromMnemonic(
      mockCommitmentsSameCompressedZkpPK,
      mockCompressedZkpPublicKey,
    );
    expect(commitmentsFromMnemonicReturn).toBeTruthy();
  });

  test("should pass a list of commitments with different compressedPkd and receive an error", async () => {
    expect(() =>
      commitmentsFromMnemonic(
        mockCommitments.data.commitmentsByListOfCompressedZkpPublicKey,
        mockCompressedZkpPublicKey,
      ),
    ).rejects.toThrow();
  });
});
