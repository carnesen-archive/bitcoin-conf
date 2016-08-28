'use strict';

const { dirname } = require('path');

const ini = require('ini');
const { writeFile, ensureDir } = require('@carnesen/fs');

const resolveConfPath = require('./resolveConfPath');

module.exports = function* readConfFile(passed = {}) {

  const { conf } = resolveConfPath(passed);

  yield ensureDir(dirname(conf));

  const contents = ini.stringify(passed.options || {});

  yield writeFile(conf, contents);

};
