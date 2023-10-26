import { createLogger, format, transports } from 'winston';
const { combine, splat, timestamp, printf } = format;

const enumerateErrorFormat = format((info: any) => {
  if (info.message instanceof Error) {
    info.message = Object.assign(
      {
        message: info.message.message,
        stack: info.message.stack,
      },
      info.message,
    );
  }

  if (info instanceof Error) {
    return Object.assign(
      {
        message: info.message,
        stack: info.stack,
      },
      info,
    );
  }

  return info;
});

const logger = createLogger({
  level: 'debug',
  format: combine(
    enumerateErrorFormat(),
    splat(),
    timestamp(),
    printf(
      ({ level, message, timestamp, stack }) =>
        `\n**************************************************************************************************************************************\n${timestamp} ${level} : ${stack ? JSON.stringify(stack) : message}\n**************************************************************************************************************************************\n`,
    ),
  ),
  transports: [new transports.Console({})],
});

export default logger;
