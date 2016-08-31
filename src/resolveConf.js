'use strict';

const path = require('path');

const expandHomeDir = require('expand-home-dir');

const C = require('./constants');

module.exports = function resolveConf(passed) {

  const cwd = process.cwd();

  let { datadir = cwd, conf = C.conf.defaultValue } = passed || {};

  datadir = expandHomeDir(datadir);
  if (!path.isAbsolute(datadir)) {
    datadir = path.resolve(cwd, datadir);
  }

  conf = expandHomeDir(conf);
  if (!path.isAbsolute(conf)) {
    conf = path.resolve(datadir, conf);
  }

  return conf;

};
