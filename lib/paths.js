const path = require('path');

module.exports = {
    APP_ROOT: process.env.APP_ROOT,
    BASE_CONFIG_DIR: path.resolve(__dirname, '..', 'config'),
};
