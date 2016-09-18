
const { resolve } = require('path');

const { wrap } = require('co');
const fs = require('@carnesen/fs');

const writeFile = require('../writeFile');

const tmpDir = 'tmp';

function removeTmpDir() {
  return fs.remove(tmpDir);
}

describe('writeFile', function () {

  before(removeTmpDir);
  after(removeTmpDir);

  it('writes bitcoin.conf', wrap(function* () {
    const filePath = resolve(tmpDir, 'bitcoin.conf');
    yield writeFile(filePath, { foo: 'bar' });
    const contents = yield fs.readFile(filePath, { encoding: 'utf8' });
    contents.should.match(/foo=bar\r?\n/);
  }));

});
