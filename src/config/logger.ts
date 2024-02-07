import { createLogger, format, transports, Logger } from 'winston';

const { combine, timestamp, printf, colorize } = format;

interface LogFormat {
    level: string;
    message: string;
    label?: string;
    timestamp?: string;
}

const custom_format = printf((info: LogFormat) => {
    const { level, message, timestamp } = info;
    return `[${timestamp}] [${level}] ${message}`;
});

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'blue'
    }
};


const developmentLogger = () => {
    return createLogger({
        levels: customLevels.levels,
        format: combine(
            colorize({ all: true, colors: customLevels.colors }),
            timestamp({ format: "YY-MM-DD HH:MM:SS" }),
            custom_format,
        ),
        transports: [
            new transports.File({ filename: 'logs/error.log', level: 'error' }),
            new transports.File({ filename: 'logs/warn.log', level: 'warning' }),
            new transports.File({ filename: 'logs/info.log', level: 'info' }),
            new transports.Console(),
        ],
    });
}

const productionLogger = () => {
    return createLogger({
        levels: customLevels.levels,
        format: combine(
            colorize({ all: true, colors: customLevels.colors }),
            timestamp(),
            custom_format,
        ),
        transports: [
            new transports.File({ filename: 'logs/error.log', level: 'error' }),
            new transports.File({ filename: 'logs/warn.log', level: 'warning' }),
            new transports.File({ filename: 'logs/info.log', level: 'info' }),
            new transports.Console(),
        ],
    });
}

let logger: Logger = developmentLogger();

if (process.env.NODE_ENV === 'production') {
    logger = productionLogger();
}

export default logger;