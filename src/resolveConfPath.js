'use strict';

const { isAbsolute, resolve } = require('path');

const expandHomeDir = require('expand-home-dir');

const C = require('./constants');

module.exports = function resolveConfPath(passed) {

  let { datadir = process.cwd(), conf = C.conf.defaultValue } = passed || {};

  datadir = expandHomeDir(datadir);
  if (!isAbsolute(datadir)) {
    datadir = resolve(process.cwd(), datadir);
  }

  conf = expandHomeDir(conf);
  if (!isAbsolute(conf)) {
    conf = resolve(datadir, conf);
  }

  return { datadir, conf };

};
