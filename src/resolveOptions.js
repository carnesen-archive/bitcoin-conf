'use strict';

const { isAbsolute, resolve: pathResolve } = require('path');

const expandHomeDir = require('expand-home-dir');
const { firstDefined, isDefined, isFunction } = require('@carnesen/util');

const { options, types } = require('./constants');

module.exports = function resolve(...args) {

  // Each arg is an object containing configuration properties with left-most taking priority

  const passed = [...args].reduceRight((reduction, arg) => Object.assign(reduction, arg), {});

  const result = {};

  // First process options whose default value is not a function
  Object.keys(options).forEach(name => {
    const defaultValue = options[name].defaultValue;
    if (!isFunction(defaultValue)) {
      const value = firstDefined(passed[name], defaultValue);
      if (isDefined(value)) {
        result[name] = value;
      }
    }
  });

  // Now process options whose default value is a function
  Object.keys(options).forEach(name => {
    const defaultValueFunction = options[name].defaultValue;
    if (isFunction(defaultValueFunction)) {
      const value = firstDefined(passed[name], defaultValueFunction(result));
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
      result[name] = pathResolve(result.datadir, result[name]);
    }
  });

  return result;

};
