const getTimestamp = () => new Date().toISOString();

export const logger = {
  info: (...args) => {
    console.log(`[${getTimestamp()}] [INFO]`, ...args);
  },
  error: (...args) => {
    console.error(`[${getTimestamp()}] [ERROR]`, ...args);
  },
  warn: (...args) => {
    console.warn(`[${getTimestamp()}] [WARN]`, ...args);
  },
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${getTimestamp()}] [DEBUG]`, ...args);
    }
  },
};
