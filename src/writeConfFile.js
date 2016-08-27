'use strict';

const ini = require('ini');
const { writeFile, ensureDir } = require('@carnesen/fs');

const resolveConfPath = require('./resolveConfPath');

module.exports = function* readConfFile(passed = {}) {

  const { datadir, conf } = resolveConfPath(passed);

  yield ensureDir(datadir);

  const contents = ini.stringify(passed.options || {});

  yield writeFile(conf, contents);

};
