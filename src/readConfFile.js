'use strict';

const ini = require('ini');
const { readFile } = require('@carnesen/fs');

const resolveConfPath = require('./resolveConfPath');

module.exports = function* readConfFile(passed) {

  const { conf } = resolveConfPath(passed);

  const contents = yield readFile(conf, 'utf8');
  return ini.parse(contents);

};
