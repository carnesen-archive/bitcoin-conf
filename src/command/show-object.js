'use strict';

const ini = require('ini');

const show = require('./show');

module.exports = {
  name: 'show-object',
  description: 'gets and parses the conf file',
  parameters: [],
  execute: function* () {
    const contents = yield show.execute();
    return ini.parse(contents);
  }
};
