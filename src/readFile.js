'use strict';

const ini = require('ini');
const fs = require('@carnesen/fs');
const util = require('@carnesen/util');

const log = require('./log');

module.exports = function* readFile(filePath) {

  util.throwIfNotPositiveLengthString(filePath, 'filePath');

  const contents = yield fs.readFile(filePath, 'utf8');

  log.info(`Read ${ filePath }`);

  return ini.parse(contents);

};
