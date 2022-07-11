import { AxiosResponse } from "axios";
import Client from "../../libs/client/client";
import mockCommitments from "../mockCommitments";

const getAllCommitmentsByCompressedPkdStub = jest
  .spyOn(Client.prototype, "getAllCommitmentsByCompressedPkd")
  .mockImplementation(
    () => mockCommitments as unknown as Promise<AxiosResponse<any, any>>,
  );
export default getAllCommitmentsByCompressedPkdStub;
