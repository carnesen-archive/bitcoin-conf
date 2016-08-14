'use strict';

const expandHomeDir = require('expand-home-dir');

module.exports = {
  configFile: expandHomeDir('~/.bitcoin-conf')
};
