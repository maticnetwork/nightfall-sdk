/**
 *
 * @function convertObjectToString has the goal of transform an object
 * in a string format.
 * @param obj an object.
 * @returns a JSON strigify of the object received in the parameter.
 */
const convertObjectToString = (obj: object) => {
  if (typeof obj !== "object") {
    throw new Error("The parameter passed is not an object!");
  }
  return JSON.stringify(obj);
};

export default convertObjectToString;
