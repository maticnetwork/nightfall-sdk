import pino from "pino";

const LOGGER_TIME_STRING = "yyyy-mm-dd HH:MM:ss";

const logger = pino({
  level: process.env.LOG_LEVEL || "debug",
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
