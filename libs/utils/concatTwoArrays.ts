/**
 *
 * @function concatTwoArrays has the goal of concat two array of objects.
 * @param array1 array of objects.
 * @param array2 array of objects.
 * @returns array1 concated with array2.
 * @author luizoamorim
 */
export const concatTwoArrays = (
  array1: Array<object>,
  array2: Array<object>,
) => {
  if (array1 === null || array2 === null)
    throw new Error(`Array can't be null!`);
  return array1.concat(array2);
};
