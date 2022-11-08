declare const logger: import("pino").Logger<{
    level: string;
    transport: {
        target: string;
        options: {
            colorize: boolean;
            ignore: string;
            translateTime: string;
        };
    };
}>;
export default logger;
