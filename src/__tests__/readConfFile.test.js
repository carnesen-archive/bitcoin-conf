
const { wrap } = require('co');

const readConfFile = require('../readConfFile');

describe('readConfFile', function () {

  it('reads bitcoin.conf if conf is not provided', wrap(function* () {
    const options = yield readConfFile({ datadir: __dirname });
    options.foo.should.eql('bar');
  }));

  it('reads conf if provided', wrap(function* () {
    const options = yield readConfFile({ datadir: __dirname, conf: 'bitcoin2.conf' });
    options.foo.should.eql('bar');
  }));

});
