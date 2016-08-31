'use strict';

const ini = require('ini');
const fs = require('@carnesen/fs');
const util = require('@carnesen/util');

module.exports = function* readFile(filePath) {

  util.throwIfNotPositiveLengthString(filePath, 'filePath');

  const contents = yield fs.readFile(filePath, 'utf8');

  return ini.parse(contents);

};
