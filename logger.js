const winston = require('winston');

// defining log levels
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
  }
};

// Create the logger instance
const logger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ sessionID, timestamp, level, message,...metadata }) => {
      return `SessionID -> ${sessionID} [${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/combined.log', // Logs all levels
      level: 'debug'
    })
  ]
});

module.exports = logger;