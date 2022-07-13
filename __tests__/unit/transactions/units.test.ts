import {
  isString,
  isPositive,
  isValueValid,
  isDecimalPartValid,
} from "../../../libs/transactions/helpers/units";

describe("Units", () => {
  describe("Is string", () => {
    test("Should return true when passing string", () => {
      const s = "turtle";
      expect(isString(s)).toBeTruthy();
    });

    test("Should return true when passing empty string", () => {
      const s = "";
      expect(isString(s)).toBeTruthy();
    });

    test("Should return false when passing anything other than string", () => {
      const s = 1;
      expect(isString(s)).toBeFalsy();
    });
  });

  describe("Is Positive", () => {
    test("Should return true when passing string value not starting with `-`", () => {
      const v = "777";
      expect(isPositive(v)).toBeTruthy();
    });

    test("Should return true when passing empty string", () => {
      const v = "";
      expect(isPositive(v)).toBeTruthy();
    });

    test("Should return false when passing string value starting with `-`", () => {
      const v = "-777";
      expect(isPositive(v)).toBeFalsy();
    });
  });

  describe("Is Value Valid", () => {
    test("Should return true when passing string value different from `.`", () => {
      const v = "777";
      expect(isValueValid(v)).toBeTruthy();
    });

    test("Should return true when passing empty string", () => {
      const v = "";
      expect(isValueValid(v)).toBeTruthy();
    });

    test("Should return false when passing string value `.`", () => {
      const v = ".";
      expect(isValueValid(v)).toBeFalsy();
    });
  });

  describe("Is Decimal Part Valid", () => {
    test("Should return true when passing no decimal points", () => {
      const v = "777";
      expect(isDecimalPartValid(v)).toBeTruthy();
    });

    test("Should return true when passing only decimal part", () => {
      const v = ".1";
      expect(isDecimalPartValid(v)).toBeTruthy();
    });

    test("Should return true when passing empty string", () => {
      const v = "";
      expect(isDecimalPartValid(v)).toBeTruthy();
    });

    test("Should return false when passing multiple decimal points", () => {
      const v = "0..0";
      expect(isDecimalPartValid(v)).toBeFalsy();
    });
  });
});
