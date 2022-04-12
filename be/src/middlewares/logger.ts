import { Context } from 'koa';
import { config } from '../config';
import { transports, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { pad } from '../helperString';

export const timezoned = () => {
    const d = new Date();
    return d.toLocaleString('ru-RU', {
        timeZone: 'Asia/Yekaterinburg'
    }) + `.${pad(d.getMilliseconds(), 3, '0')}`;
};

export const logger = (winstonInstance: any): any  => {
    winstonInstance.configure({
        format: format.combine(
          format.colorize(),
          format.timestamp({ format: timezoned }),
          format.align(),
          format.printf(
            info => `${info.timestamp} ${info.level}: ${info.message}`
          )
        ),
        level: config.debugLogging ? 'debug' : 'info',
        transports: [
            //
            // - Write all logs error (and below) to `error.log`.
            new DailyRotateFile({
                filename: './logs/error.%DATE%.txt',
                datePattern: 'YYYY-MM-DD',
                level: 'error',
                maxFiles: '14d',
                createSymlink: true,
                symlinkName: 'error.today.txt'
            }),
            //
            // - Write to all logs with specified level to console.
            new transports.Console({})
        ]
    });

    console.log = (...args) => winstonInstance.info.call(logger, ...args);
    console.info = (...args) => winstonInstance.info.call(logger, ...args);
    console.warn = (...args) => winstonInstance.warn.call(logger, ...args);
    console.error = (...args) => winstonInstance.error.call(logger, ...args);
    console.debug = (...args) => winstonInstance.debug.call(logger, ...args);

    return async (ctx: Context, next: () => Promise<any>): Promise<void> => {

        const start = new Date().getTime();

        await next();

        const ms = new Date().getTime() - start;

        let logLevel: string;
        if (ctx.status >= 500) {
            logLevel = 'error';
        } else if (ctx.status >= 400) {
            logLevel = 'warn';
        } else {
            logLevel = 'info';
        }

        const msg = `${ctx.method} ${ctx.originalUrl} ${ctx.status} ${ms}ms`;

        winstonInstance.log(logLevel, msg);
    };
};