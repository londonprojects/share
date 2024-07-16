const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const colors = {
  error: '\x1b[31m', // red
  warn: '\x1b[33m', // yellow
  info: '\x1b[34m', // blue
  debug: '\x1b[32m', // green
  reset: '\x1b[0m', // reset
};

const logger = {
  log: (level, message, ...optionalParams) => {
    if (levels[level] <= levels[LOG_LEVEL]) {
      console.log(`${colors[level]}[${level.toUpperCase()}]${colors.reset} ${message}`, ...optionalParams);
    }
  },
  error: (message, ...optionalParams) => logger.log('error', message, ...optionalParams),
  warn: (message, ...optionalParams) => logger.log('warn', message, ...optionalParams),
  info: (message, ...optionalParams) => logger.log('info', message, ...optionalParams),
  debug: (message, ...optionalParams) => logger.log('debug', message, ...optionalParams),
};

export default logger;
