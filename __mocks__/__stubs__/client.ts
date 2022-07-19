import ICommitments from "libs/models/commitment";
import Client from "../../libs/client/client";
import mockCommitments from "../mockCommitments";

const getAllCommitmentsByCompressedPkdStub = jest
  .spyOn(Client.prototype, "getCommitmentsByCompressedZkpPublicKey")
  .mockImplementation(
    () =>
      mockCommitments.data
        .commitmentsByListOfCompressedZkpPublicKey as unknown as Promise<
        ICommitments[]
      >,
  );
export default getAllCommitmentsByCompressedPkdStub;
