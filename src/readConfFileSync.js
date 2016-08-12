'use strict';

const { isAbsolute, resolve } = require('path');
const { readFileSync } = require('fs');

const expandHomeDir = require('expand-home-dir');
const ini = require('ini');

const C = require('./constants');

module.exports = function readConfFileSync(passed) {

  passed = passed || {};

  let datadir = expandHomeDir(passed.datadir || C.datadir.default);

  if (!isAbsolute(datadir)) {
    datadir = resolve(process.cwd(), datadir);
  }

  let conf = expandHomeDir(passed.conf || C.conf.default);
  if (!isAbsolute(conf)) {
    conf = resolve(datadir, conf);
  }

  let result = {};

  try {

    const contents = readFileSync(conf, 'utf8');
    result = ini.parse(contents);

  } catch (e) {

    if (e.code !== 'ENOENT' || passed.datadir || passed.conf) {
      // ENOENT means the file doesn't exist
      throw e;
    }

  }

  return result;

};
