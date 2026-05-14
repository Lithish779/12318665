const { Log } = require('../../../logging_middleware/logger');

async function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', async () => {
    const ms    = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    await Log('backend', level, 'middleware', `${req.method} ${req.originalUrl} ${res.statusCode} (${ms}ms)`);
  });
  next();
}

module.exports = { requestLogger };
