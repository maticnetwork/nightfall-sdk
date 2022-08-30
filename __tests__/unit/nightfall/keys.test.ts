import {
  createMnemonic,
  validateNfMnemonic,
} from "../../../libs/nightfall/helpers";
import { validateOrCreateNfMnemonic } from "../../../libs/nightfall/keys";
import { NightfallSdkError } from "../../../libs/utils/error";

jest.mock("../../../libs/nightfall/helpers", () => {
  const originalModule = jest.requireActual("../../../libs/nightfall/helpers");
  const mockedCreateMnemonic = jest.fn();
  const mockedValidateMnemonic = jest.fn();

  return {
    __esModule: true,
    ...originalModule,
    createMnemonic: mockedCreateMnemonic,
    validateNfMnemonic: mockedValidateMnemonic,
  };
});

describe("Nightfall Keys", () => {
  describe("Validate or create Nightfall Mnemonic", () => {
    const FAKE_MNEMONIC =
      "seed sock milk update focus rotate barely fade car face mechanic mercy";

    test("Should return new bip39 mnemonic when none was given", () => {
      // Arrange
      (createMnemonic as jest.Mock).mockReturnValue(FAKE_MNEMONIC);

      // Act
      let givenNfMnemonic;
      const newNfMnemonic = validateOrCreateNfMnemonic(givenNfMnemonic);

      // Assert
      expect(createMnemonic).toHaveBeenCalled();
      expect(newNfMnemonic).toBe(FAKE_MNEMONIC);
    });

    test("Should return given mnemonic if it is valid", () => {
      // Arrange
      (validateNfMnemonic as jest.Mock).mockReturnValue(true);

      // Act
      const newNfMnemonic = validateOrCreateNfMnemonic(FAKE_MNEMONIC);

      // Assert
      expect(validateNfMnemonic).toHaveBeenCalled();
      expect(newNfMnemonic).toBe(FAKE_MNEMONIC);
    });

    test("Should throw an error if mnemonic is not bip39 valid", () => {
      // Arrange
      (validateNfMnemonic as jest.Mock).mockImplementation(() => {
        throw new Error("invalid mnemonic");
      });

      // Act, Assert
      expect(() => validateOrCreateNfMnemonic(FAKE_MNEMONIC)).toThrow(
        NightfallSdkError,
      );
      expect(validateNfMnemonic).toHaveBeenCalled();
    });
  });
});
