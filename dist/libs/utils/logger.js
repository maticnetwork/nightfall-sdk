"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const LOGGER_DEFAULT_LEVEL = process.env.LOG_LEVEL || "info";
const LOGGER_TIME_STRING = "yyyy-mm-dd HH:MM:ss";
const logger = (0, pino_1.default)({
    level: LOGGER_DEFAULT_LEVEL,
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            ignore: "pid,hostname,filename",
            translateTime: LOGGER_TIME_STRING,
        },
    },
});
exports.default = logger;
//# sourceMappingURL=logger.js.map