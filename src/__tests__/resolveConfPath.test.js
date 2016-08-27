
const { resolve } = require('path');

const expandHomeDir = require('expand-home-dir');

const resolveConfPath = require('../resolveConfPath');

describe('resolveConfPath', function () {

  it('expands ~ in datadir', function () {
    resolveConfPath({ datadir: '~' }).datadir.should.equal(resolve(expandHomeDir('~')));
  });

  it('datadir is process.cwd() if not defined', function () {
    resolveConfPath().datadir.should.equal(process.cwd());
  });

});
