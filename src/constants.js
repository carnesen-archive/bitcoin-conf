'use strict';

const { resolve } = require('path');
const { platform } = require('os');

const defaultDataDirMap = {
  darwin: '~/Library/Application Support/Bitcoin/',
  win32: resolve(process.env.APPDATA, 'Bitcoin')
};

const flag = 'flag';
const integer = 'integer';
const path = 'path';
const string = 'string';

module.exports = {

  types: {
    flag,
    integer,
    path,
    string
  },

  conf: {
    type: path,
    description: 'Path of the config file to use in datadir. A relative path is evaluated as relative to datadir.',
    defaultValue: 'bitcoin.conf'
  },
  datadir: {
    type: path,
    description: 'Path to the bitcoin data directory. A relative path is evaluated as relative to the current working directory',
    defaultValue: defaultDataDirMap[platform()] || '~/.bitcoin'
  },
  options: {
    port: {
      type: integer,
      description: 'Listen for connections on this port (defaultValue: 8333 or testnet: 18333)',
      defaultValue: ({ testnet }) => testnet ? 18333 : 8333
    },
    rpcauth: {
      type: string,
      description: 'Username and hashed password for JSON-RPC connections. The field <userpw> comes in the format: <USERNAME>:<SALT>$<HASH>.'
    },
    rpcport: {
      type: integer,
      description: 'Port of the JSON-RPC interface. Default is 8332 or 18332 for testnet',
      defaultValue: ({ testnet }) => testnet ? 18332 : 8332
    },
    rpccookiefile: {
      type: path,
      description: 'Path to the RPC cookie file. A relative path is evaluated as relative to datadir',
      defaultValue: '.cookie'
    },
    rpcpassword: {
      type: string,
      description: 'Password for JSON-RPC connections'
    },
    rpcuser: {
      type: string,
      description: 'Username for JSON-RPC connections'
    },
    testnet: {
      type: flag,
      description: '1 for true (use the test chain)',
    }
  }
};
