'use strict';

const {configFile} = require('./constants');

module.exports = {
  name: 'bitcoin-conf',
  description: `operations for manipulating ${ configFile }`,
  commands: [
    require('./set'),
    require('./show'),
    require('./show-object'),
  ]
};
