'use strict';

const { resolve } = require('path');
const { platform } = require('os');

const expandHomeDir = require('expand-home-dir');

let defaultDataDir;
switch (platform()) {
  case 'darwin':
    defaultDataDir = '~/Library/Application Support/Bitcoin/';
    break;
  case 'win32':
    defaultDataDir = resolve(process.env.APPDATA || '', 'Bitcoin');
    break;
  default:
    defaultDataDir = '~/.bitcoin';
}

module.exports = {
  defaultConfFilePath: resolve(expandHomeDir(defaultDataDir), 'bitcoin.conf')
};
