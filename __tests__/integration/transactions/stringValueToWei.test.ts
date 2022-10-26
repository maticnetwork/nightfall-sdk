import { stringValueToWei } from "../../../libs/transactions";

describe("String Value To Wei", () => {
  test("Should throw error when passing value different than string", () => {
    const v = 1;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => stringValueToWei(v, 0)).toThrow();
  });

  test("Should throw error when passing empty string", () => {
    const v = "";
    expect(() => stringValueToWei(v, 0)).toThrow();
  });

  test("Should throw error when passing string value `.`", () => {
    const v = ".";
    expect(() => stringValueToWei(v, 0)).toThrow();
  });

  test("Should throw error when passing negative value, ie string starting with `-`", () => {
    const v = "-1";
    expect(() => stringValueToWei(v, 0)).toThrow();
  });

  test("Should throw error when passing multiple decimal points", () => {
    const v = "0.0.1";
    expect(() => stringValueToWei(v, 0)).toThrow();
  });

  test("Should return given value when passing tokenDecimals `0`", () => {
    const v = "0.01";
    expect(stringValueToWei(v, 0)).toBe(v);
  });

  test("Should throw error when value fraction length is bigger than tokenDecimals", () => {
    const v = "0.1234567";
    const decimals = 6;
    expect(() => stringValueToWei(v, decimals)).toThrow();
  });

  test("Should return value in wei when value has no decimals", () => {
    const v = "2";
    const decimals = 18;
    const vToBaseUnits = "2000000000000000000";
    expect(stringValueToWei(v, decimals)).toBe(vToBaseUnits);
  });

  test("Should return value in wei when value has decimal part", () => {
    const v = "0.0002";
    const decimals = 18;
    const vToBaseUnits = "200000000000000";
    expect(stringValueToWei(v, decimals)).toBe(vToBaseUnits);
  });

  test("Should return value in wei when passing only decimal part", () => {
    const v = ".12345678";
    const decimals = 18;
    const vToBaseUnits = "123456780000000000";
    expect(stringValueToWei(v, decimals)).toBe(vToBaseUnits);
  });
});
