import pino from "pino";

const LOGGER_DEFAULT_LEVEL = "debug";
const LOGGER_TIME_STRING = "yyyy-mm-dd HH:MM:ss";

const logger = pino({
  level: process.env.SDK_LOGGER_LEVEL || LOGGER_DEFAULT_LEVEL, // TODO review
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
