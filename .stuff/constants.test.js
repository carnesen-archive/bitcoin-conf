
require('chai').should();

const constants = require('../src/constants');

describe('tests', function () {

  function testOption(name, value) {
    it(`Option "${ name }" has a type and a description`, function () {
      value.type.should.be.a('string');
      value.description.should.be.a('string');
    });
  }

  Object.keys(constants.options).forEach(name => {
    const value = constants.options[name];
    testOption(name, value);
  });

  ['datadir', 'conf'].forEach(name => {
    const value = constants[name];
    testOption(name, value);
  });

});
