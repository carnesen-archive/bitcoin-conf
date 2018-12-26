import { join } from 'path';
import { platform, homedir } from 'os';
import { SectionedBitcoinConfig } from './config';
import { BITCOIN_CONFIG_OPTIONS } from './options';
import { SECTION_NAMES } from './names';

export const BITCOIN_CONF_FILENAME = 'bitcoin.conf';

export const getDefaultDatadir = (p = platform()) => {
  switch (p) {
    case 'darwin':
      return join(homedir(), 'Library', 'Application Support', 'Bitcoin');
    case 'win32':
      return join(process.env.APPDATA!, 'Bitcoin');
    default:
      return join(homedir(), '.bitcoin');
  }
};

type OptionName = keyof typeof BITCOIN_CONFIG_OPTIONS;

export const getDefaultSectionedBitcoinConfig = (p = platform()) => {
  const sectionedBitcoinConfig: SectionedBitcoinConfig = {
    datadir: getDefaultDatadir(p),
    sections: {
      main: {},
      regtest: {},
      test: {},
    },
  };
  for (const [optionName, option] of Object.entries(BITCOIN_CONFIG_OPTIONS)) {
    const { defaultValue } = option;
    if (typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
      SECTION_NAMES.forEach(sectionName => {
        sectionedBitcoinConfig.sections![sectionName]![optionName as OptionName];
      });
    } else {
      sectionedBitcoinConfig[optionName as OptionName] = defaultValue;
    }
  }
  return sectionedBitcoinConfig;
};
