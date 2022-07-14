import ICommitments from "libs/models/commitment";
import Client from "../../libs/client/client";
import mockCommitments from "../mockCommitments";

const getAllCommitmentsByCompressedPkdStub = jest
  .spyOn(Client.prototype, "getAllCommitmentsByCompressedZkpPublicKey")
  .mockImplementation(
    () =>
      mockCommitments.data
        .allCommitmentsByListOfCompressedZkpPublicKey as unknown as Promise<
        ICommitments[]
      >,
  );
export default getAllCommitmentsByCompressedPkdStub;
