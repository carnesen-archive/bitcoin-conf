'use strict';

const path = require('path');

const util = require('@carnesen/util');
const expandHomeDir = require('expand-home-dir');

const { options, types } = require('./constants');

module.exports = function resolve(...args) {


  // const defaults = {};
  // const defaultFunctions = {};
  // Object.keys(options).forEach(name => {
  //   const defaultValue = options[name].default;
  //   if (defaultValue) {
  //     if (util.isFunction(defaultValue)) {
  //       defaultFunctions
  //     }
  //   }
  // });

  const passed = [...args].reduceRight((reduction, arg) => Object.assign(reduction, arg), {});

  const result = {};

  // First process options whose default value is not a function
  Object.keys(options).forEach(name => {
    const defaultValue = options[name].default;
    if (!util.isFunction(defaultValue)) {
      const value = util.firstDefined(passed[name], defaultValue);
      if (isDefined(value)) {
        result[name] = value;
      }
    }
  });

  // Now process options whose default value is a function
  Object.keys(options).forEach(name => {
    const defaultValueFunction = options[name].default;
    if (util.isFunction(defaultValueFunction)) {
      const value = util.firstDefined(passed[name], defaultValueFunction(result));
      if (isDefined(value)) {
        result[name] = value;
      }
    }
  });

  // Finally expand all values whose type is path
  Object.keys(result).forEach(name => {
    if (options[name].type === types.path) {
      result[name] = expandHomeDir(result[name]);
    }
    if (!isAbsolute(result[name])) {
      result[name] = resolve(result.datadir, result.rpccookiefile);
    }
  });

  result.rpccookiefile = expandHomeDir(passed.rpccookiefile || config.rpccookiefile || defaults.rpccookiefile);
  if (!isAbsolute(result.rpccookiefile)) {
    result.rpccookiefile = resolve(result.datadir, result.rpccookiefile);
  }

  result.testnet = passed.testnet || config.testnet;
  result.rpcport = passed.rpcport || config.rpcport || defaults.rpcport(result.testnet);
  result.rpcauth = passed.rpcauth || config.rpcauth;
  result.rpcuser = passed.rpcuser || config.rpcuser;
  result.rpcpassword = passed.rpcpassword || config.rpcpassword;

  return result;

};
