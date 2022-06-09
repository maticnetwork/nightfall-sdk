import pino from "pino";

const LOGGER_DEFAULT_LEVEL = "debug";

const logger = pino({
  level: process.env.SDK_LOGGER_LEVEL || LOGGER_DEFAULT_LEVEL, // TODO review
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      customPrettifiers: {},
      messageFormat: true,
      translateTime: true,
    },
  },
});

export default logger;
