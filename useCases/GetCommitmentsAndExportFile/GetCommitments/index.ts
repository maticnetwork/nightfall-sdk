import axios from "axios";

export const getCommitmentsOnChain = async () => {
  const response = await axios.get(
    `${process.env.SDK_ENV_API_URL}/commitment/commitments`,
  );
  return response;
};

export const getCommitmentsOffChain = async () => {
  const response = await axios.get(
    `${process.env.SDK_ENV_API_URL}/commitments/commitment`,
  );
  return response;
};
