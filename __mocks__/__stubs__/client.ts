import { Commitment } from "libs/types";
("../../libs/types");
import Client from "../../libs/client/client";
import mockCommitments from "../mockCommitments";

const getAllCommitmentsByCompressedPkdStub = jest
  .spyOn(Client.prototype, "getCommitmentsByCompressedZkpPublicKey")
  .mockImplementation(
    () =>
      mockCommitments.data
        .commitmentsByListOfCompressedZkpPublicKey as unknown as Promise<
        Commitment[]
      >,
  );
export default getAllCommitmentsByCompressedPkdStub;
