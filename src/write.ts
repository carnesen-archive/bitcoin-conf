import { BitcoinConfig } from './config';
import { toAbsolute, findOption } from './util';
import { BITCOIN_CONF_FILENAME } from './default';
import { writeFileSync } from 'fs';
import { BITCOIN_CONFIG_KEYS } from './constants';
import { serialize } from './option';
const pkg = require('../package.json');

export const writeConfFiles = (
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

  for (const bitcoinConfigKey of BITCOIN_CONFIG_KEYS) {
    const sectionConfig = bitcoinConfig[bitcoinConfigKey];
    if (!sectionConfig) {
      continue;
    }
    if (bitcoinConfigKey !== 'top') {
      append(`[${bitcoinConfigKey}]`);
      append();
    }
    for (const [optionName, optionValue] of Object.entries(sectionConfig)) {
      const { option } = findOption(optionName);
      comment(option.description);
      if (typeof optionValue !== 'undefined') {
        append(serialize(optionName, optionValue));
        append();
      }
    }
  }

  const filePath = toAbsolute(conf || BITCOIN_CONF_FILENAME, datadir);
  writeFileSync(filePath, fileContents);
};
