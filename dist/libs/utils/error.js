"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NightfallSdkError = void 0;
class NightfallSdkError extends Error {
    constructor(message) {
        super(message);
        this.name = "NightfallSdkError";
    }
}
exports.NightfallSdkError = NightfallSdkError;
//# sourceMappingURL=error.js.map