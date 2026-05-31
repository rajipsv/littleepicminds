const fs = require('fs');
const path = require('path');
const { ENV_PATH } = require('./data-dir');

function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return;
  require('dotenv').config({ path: ENV_PATH });
}

module.exports = { loadEnv, ENV_PATH };
