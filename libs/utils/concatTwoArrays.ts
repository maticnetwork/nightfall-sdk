export const concatTwoArrays = (
  array1: Array<object>,
  array2: Array<object>,
) => {
  if (array1 === null || array2 === null)
    throw new Error(`Array can't be null!`);
  return array1.concat(array2);
};
