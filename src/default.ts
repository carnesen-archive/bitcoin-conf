import { join } from 'path';
import { platform, homedir } from 'os';
import { BitcoinConfig } from './config';
import { BITCOIN_CONFIG_OPTIONS } from './options';

export const BITCOIN_CONF_FILENAME = 'bitcoin.conf';

export const getDefaultDatadir = (p = platform()) => {
  switch (p) {
    case 'darwin':
      return join(homedir(), 'Library', 'Application Support', 'Bitcoin');
    case 'win32':
      if (!process.env.APPDATA) {
        throw new Error('Expected to find environment variable "APPDATA"');
      }
      return join(process.env.APPDATA, 'Bitcoin');
    default:
      return join(homedir(), '.bitcoin');
  }
};

export const getDefaultBitcoinConfig = (p = platform()) => {
  const bitcoinConfig: BitcoinConfig = {
    top: {
      datadir: getDefaultDatadir(p),
    },
    main: {},
    regtest: {},
    test: {},
  };
  for (const [optionName, option] of Object.entries(BITCOIN_CONFIG_OPTIONS)) {
    const { defaultValue } = option;
    if (
      defaultValue !== null &&
      typeof defaultValue === 'object' &&
      !Array.isArray(defaultValue)
    ) {
      (bitcoinConfig as any).main[optionName] = defaultValue.main;
      (bitcoinConfig as any).regtest[optionName] = defaultValue.regtest;
      (bitcoinConfig as any).test[optionName] = defaultValue.test;
    } else {
      (bitcoinConfig as any).top[optionName] = defaultValue;
    }
  }
  return bitcoinConfig;
};
