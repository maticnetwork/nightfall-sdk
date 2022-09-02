import { commitmentsFromMnemonic } from "../../../libs/nightfall";
import mockCommitmentsSameCompressedZkpPK from "../../../__mocks__/mockCommitmentsSameCompressedZkpPK";
import mockCompressedZkpPublicKey from "../../../__mocks__/mockCompressedZkpPublicKey";
import mockCommitments from "../../../__mocks__/mockCommitments";
import { NightfallSdkError } from "../../../libs/utils/error";

describe("Suit for testing commitmentsFromMnemonic function", () => {
  test("Should return `true` when processing a list of commitments with the same compressedZkpPublicKey", () => {
    const commitmentsFromMnemonicReturn = commitmentsFromMnemonic(
      mockCommitmentsSameCompressedZkpPK,
      mockCompressedZkpPublicKey,
    );
    expect(commitmentsFromMnemonicReturn).toBeTruthy();
  });

  test("Should throw error when processing a list of commitments with different compressedZkpPublicKey", () => {
    expect(() =>
      commitmentsFromMnemonic(
        mockCommitments.data.commitmentsByListOfCompressedZkpPublicKey,
        mockCompressedZkpPublicKey,
      ),
    ).toThrow(NightfallSdkError);
  });
});
