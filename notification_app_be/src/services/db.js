const fs   = require('fs');
const path = require('path');
const { Log } = require('../../../logging_middleware/logger');

const DB_PATH = path.join(__dirname, '..', '..', 'notifications.json');

let data = { notifications: [] };

function initDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } else {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    }
    Log('backend', 'info', 'db', `JSON DB initialized at ${DB_PATH}`);
  } catch (err) {
    Log('backend', 'fatal', 'db', `DB init failed: ${err.message}`);
  }
}

function getDB() {
  return {
    get: () => data.notifications,
    save: (newNotifs) => {
      data.notifications = newNotifs;
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    }
  };
}

module.exports = { initDB, getDB };
