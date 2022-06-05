import pino from "pino";

// TODO log level
const logger = pino({
  level: "debug",
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
