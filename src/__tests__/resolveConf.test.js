
const { resolve } = require('path');

const expandHomeDir = require('expand-home-dir');

const resolveConf = require('../resolveConf');

describe('resolveConf', function () {

  it('expands ~ in datadir', function () {
    resolveConf({ datadir: '~' }).should.equal(resolve(expandHomeDir('~'), 'bitcoin.conf'));
  });

  it('datadir is process.cwd() if not defined', function () {
    resolveConf().should.equal(resolve(process.cwd(), 'bitcoin.conf'));
  });

});
