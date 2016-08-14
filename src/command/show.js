'use strict';

const {readFile} = require('@carnesen/fs');

const {configFile} = require('./constants');

module.exports = {

  name: 'show',
  description: `Display the contents of ${ configFile }`,
  parameters: [],

  execute: function* () {

    let contents;

    try {

      contents = yield readFile(configFile, {encoding: 'utf8'})

    } catch (ex) {

      // If they've never called "set", the file doesn't exist
      if (ex.code !== 'ENOENT') {
        throw ex;
      } else {
        contents = '';
      }

    }

    return contents;

  }

};
