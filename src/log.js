'use strict';

const { createLogger } = require('@carnesen/util');

const { name } = require('../package.json');

module.exports = createLogger(name);
