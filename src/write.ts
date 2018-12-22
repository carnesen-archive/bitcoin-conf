import { writeFileSync } from 'fs';
import { EOL } from 'os';

import { BitcoinConfig } from './config';
import { toAbsolute, findOption } from './util';
import { BITCOIN_CONF_FILENAME } from './default';
import { Value, TypeName } from './options';
import { SECTION_NAMES } from './names';
const pkg = require('../package.json');

const serialize = (optionName: string, optionValue: Value<TypeName>) => {
  if (Array.isArray(optionValue)) {
    return optionValue
      .map(optionValueItem => `${optionName}=${optionValueItem}`)
      .join(EOL);
  }
  if (optionValue === true) {
    return `${optionName}=1`;
  }
  if (optionValue === false) {
    return `${optionName}=0`;
  }
  return `${optionName}=${optionValue}`;
};

export const writeConfigFiles = (
  bitcoinConfig: BitcoinConfig,
  options: { conf?: string; datadir?: string } = {},
) => {
  const { conf, datadir } = options;
  let fileContents = '';
  const append = (str?: string) => {
    if (str) {
      fileContents += str;
    }
    fileContents += '\n';
  };
  const comment = (x: string | string[]) => {
    if (typeof x === 'string') {
      append(`# ${x}`);
    } else {
      for (const str of x) {
        append(`# ${str}`);
      }
    }
  };

  comment(`${new Date()}: This file was written by ${pkg.name}`);
  append();

  for (const sectionName of SECTION_NAMES) {
    const sectionConfig = bitcoinConfig[sectionName];
    if (!sectionConfig) {
      continue;
    }
    if (sectionName !== 'top') {
      append(`[${sectionName}]`);
      append();
    }
    for (const [optionName, optionValue] of Object.entries(sectionConfig)) {
      const { option } = findOption(optionName);
      comment(option.description);
      if (optionValue != null) {
        append(serialize(optionName, optionValue));
        append();
      }
    }
  }

  const filePath = toAbsolute(conf || BITCOIN_CONF_FILENAME, datadir);
  writeFileSync(filePath, fileContents);
};
