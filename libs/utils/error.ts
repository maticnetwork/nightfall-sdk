export class NightfallSdkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NightfallSdkError";
  }
}
