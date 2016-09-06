'use strict';

const path = require('path');

const ini = require('ini');
const fs = require('@carnesen/fs');
const util = require('@carnesen/util');

const log = require('./log');

module.exports = function* writeFile(filePath, options) {

  util.throwIfNotPositiveLengthString(filePath, 'filePath');

  yield fs.ensureDir(path.dirname(filePath));

  const contents = ini.stringify(options || {});

  yield fs.writeFile(filePath, contents);

  log.info(`Wrote ${ filePath }`);

  return options;

};
