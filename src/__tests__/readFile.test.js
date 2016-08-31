
const { resolve } = require('path');

const { wrap } = require('co');

const readFile = require('../readFile');

describe('readFile', function () {

  it('throws if filePath is not provided', wrap(function* () {
    try {
      yield readFile();
      throw 'unexpected';
    } catch (ex) {
      ex.message.should.match(/^Expected/)
    }
  }));

  it('reads conf if provided', wrap(function* () {
    const options = yield readFile(resolve(__dirname, 'bitcoin.conf'));
    options.foo.should.eql('bar');
  }));

});
