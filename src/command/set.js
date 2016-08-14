'use strict';

const ini = require('ini');
const { writeFile } = require('@carnesen/fs');

const { configFile } = require('./constants');
const showObject = require('./show-object');

module.exports = {
  name: 'set',
  description: `Sets a value in ${ configFile }`,
  parameters: [
    {
      name: 'key',
      type: 'string',
      description: 'the name of the parameter to set',
      positional: true
    },
    {
      name: 'value',
      type: 'string',
      description: 'the value of the parameter to set',
      positional: true
    },

  ],

  execute: function* ({ key, value }) {
    const obj = yield showObject.execute();
    Object.assign(obj, { [key]: value });
    const contents = ini.stringify(obj);
    yield writeFile(configFile, contents);
    return contents;
  }
};

