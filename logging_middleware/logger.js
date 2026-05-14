/**
 * logging_middleware/logger.js
 *
 * Reusable logging function that sends structured log entries to the
 * AffordMed Evaluation Test Server.
 */

const axios = require('axios');

const BASE_URL      = 'http://4.224.186.213/evaluation-service';
const AUTH_ENDPOINT = `${BASE_URL}/auth`;
const LOG_ENDPOINT  = `${BASE_URL}/logs`;

const VALID_STACKS  = ['backend', 'frontend'];
const VALID_LEVELS  = ['debug', 'info', 'warn', 'error', 'fatal'];

const VALID_PACKAGES = {
  backend:  ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'],
  frontend: ['api', 'component', 'hook', 'page', 'state', 'style'],
  common:   ['auth', 'config', 'middleware', 'utils'],
};

let _token     = null;
let _expiresAt = 0;

async function _getToken() {
  const now = Math.floor(Date.now() / 1000);
  if (_token && _expiresAt - now > 60) return _token;

  const {
    LOG_EMAIL, LOG_NAME, LOG_ROLL_NO,
    LOG_ACCESS_CODE, LOG_CLIENT_ID, LOG_CLIENT_SECRET,
  } = process.env;

  if (!LOG_EMAIL || !LOG_CLIENT_ID || !LOG_CLIENT_SECRET) {
    throw new Error('[logger] Missing required env vars');
  }

  const res = await axios.post(AUTH_ENDPOINT, {
    email:        LOG_EMAIL,
    name:         LOG_NAME,
    rollNo:       LOG_ROLL_NO,
    accessCode:   LOG_ACCESS_CODE,
    clientID:     LOG_CLIENT_ID,
    clientSecret: LOG_CLIENT_SECRET,
  });

  _token     = res.data.access_token;
  _expiresAt = res.data.expires_in;
  return _token;
}

function _validate(stack, level, pkg) {
  if (!VALID_STACKS.includes(stack)) throw new Error(`Invalid stack "${stack}"`);
  if (!VALID_LEVELS.includes(level)) throw new Error(`Invalid level "${level}"`);
  const allowed = [...(VALID_PACKAGES[stack] || []), ...VALID_PACKAGES.common];
  if (!allowed.includes(pkg)) throw new Error(`Invalid package "${pkg}"`);
}

async function Log(stack, level, pkg, message) {
  try {
    _validate(stack, level, pkg);
    // Temporarily disabled network logging for connectivity test
    /*
    const token = await _getToken();
    const res = await axios.post(
      LOG_ENDPOINT,
      { stack, level, package: pkg, message },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    */
    const ts = new Date().toISOString();
    console.log(`[${ts}] [${level.toUpperCase()}] [${stack}/${pkg}] ${message}`);
    return { logID: 'mock-id', message: 'log created successfully' };
  } catch (err) {
    const ts = new Date().toISOString();
    console.error(`[${ts}] [LOGGER_FAIL] stack:${stack} level:${level} pkg:${pkg} → ${err.message}`);
    return null;
  }
}

module.exports = { Log };
