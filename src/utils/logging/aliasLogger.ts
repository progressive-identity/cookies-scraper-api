import { createLogger, format, transports } from 'winston'

// https://github.com/winstonjs/winston#usage
export const aliasLogger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return `[${timestamp}] ${level}: ${message}`
    })
  ),
  transports: [
    // FIXME we need to see how we can manage log files with Clever Cloud, meanwhile we'll just log in the console everywhere
    // - Write all logs with importance level of `error` or less to `error.log`
    // new transports.File({ filename: 'error.log', level: 'error' }),
    // - Write all logs with importance level of `info` or less to `combined.log`
    // new transports.File({ filename: 'combined.log' }),
    new transports.Console({}),
  ],
})
