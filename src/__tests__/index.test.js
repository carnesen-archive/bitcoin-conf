
require('chai').should();

const constants = require('../..');

describe('tests', function () {

  ['defaults', 'options'].forEach(property => it('has property ' + property, function () {
    constants.should.have.property(property);
  }));

  Object.keys(constants.defaults).forEach(name =>
    it('Default "' + name + '" has a truthy value', function () {
      Boolean(constants.defaults[name]).should.equal(true);
    })
  );

  Object.keys(constants.options).forEach(name =>
    it('Option "' + name + '" has a type and a description', function () {
      const value = constants.options[name];
      value.type.should.be.a('string');
    })
  );

});
