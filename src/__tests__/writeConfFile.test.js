
const { resolve } = require('path');

const { wrap } = require('co');
const { remove, readFile } = require('@carnesen/fs');

const writeConfFile = require('../writeConfFile');

const tmpDir = 'tmp';

function removeTmpDir() {
  return remove(tmpDir);
}

describe('writeConfFile', function () {

  before(removeTmpDir);
  after(removeTmpDir);

  it('writes bitcoin.conf', wrap(function* () {
    yield writeConfFile({ datadir: tmpDir, options: { foo: 'bar' } });
    const contents = yield readFile(resolve(tmpDir, 'bitcoin.conf'), { encoding: 'utf8' });
    contents.should.eql('foo=bar\n');
  }));

});
