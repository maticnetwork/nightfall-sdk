const convertObjectToString = (obj: object) => {
  if (typeof obj !== "object") {
    throw new Error("The parameter passed is not an object!");
  }
  return JSON.stringify(obj);
};

export default convertObjectToString;
