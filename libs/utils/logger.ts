import pino from "pino";

const LOGGER_DEFAULT_LEVEL = "debug";
const LOGGER_TIME_STRING = "yyyy-mm-dd HH:MM:ss";

const logger = pino({
  level: LOGGER_DEFAULT_LEVEL, // TODO env var
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname,filename",
      translateTime: LOGGER_TIME_STRING,
    },
  },
});

export default logger;
